import prisma from "../../../shared/lib/prisma"
import { XPostStatus } from "@prisma/client"

interface GetXPublicationsParams {
    page: number
    limit: number
    search?: string
    status?: XPostStatus
}

export class XPublicationsModel {
    static async getPaginated(params: GetXPublicationsParams) {
        const { page, limit, search, status } = params
        const skip = (page - 1) * limit

        const where: any = {}

        if (status) {
            where.status = status
        }

        if (search) {
            where.OR = [
                { text: { contains: search, mode: "insensitive" } },
                {
                    client: {
                        name: { contains: search, mode: "insensitive" },
                    },
                },
                {
                    client: {
                        username: { contains: search, mode: "insensitive" },
                    },
                },
            ]
        }

        const [items, total] = await Promise.all([
            prisma.x_posts.findMany({
                where,
                skip,
                take: limit,
                orderBy: { scheduled_at: "desc" },
                include: {
                    client: true,
                },
            }),
            prisma.x_posts.count({ where }),
        ])

        return { items, total }
    }

    static async getById(id: number) {
        return prisma.x_posts.findUnique({
            where: { id },
            include: { client: true },
        })
    }
}
