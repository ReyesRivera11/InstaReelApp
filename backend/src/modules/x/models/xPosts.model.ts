// xPosts.model.ts
import prisma from "../../../shared/lib/prisma"
import { XPostStatus, XMediaType } from "@prisma/client"

export const XPostsModel = {
    create: (data: {
        client_id: number
        text: string
        media_url?: string | null
        media_type?: XMediaType | null
        scheduled_at: Date
    }) => {
        return prisma.x_posts.create({
            data: {
                client_id: data.client_id,
                text: data.text,
                media_url: data.media_url ?? null,
                media_type: data.media_type ?? null,
                scheduled_at: data.scheduled_at,
                status: XPostStatus.SCHEDULED,
            },
        })
    },

    markPublished: (id: number, tweet_id: string) => {
        return prisma.x_posts.update({
            where: { id },
            data: {
                status: XPostStatus.PUBLISHED,
                tweet_id,
                published_at: new Date(),
                error_message: null,
            },
        })
    },

    markFailed: (id: number, error: string) => {
        return prisma.x_posts.update({
            where: { id },
            data: {
                status: XPostStatus.FAILED,
                error_message: error,
            },
        })
    },

    getPending: () => {
        return prisma.x_posts.findMany({
            where: {
                status: XPostStatus.SCHEDULED,
                scheduled_at: {
                    lte: new Date(),
                },
            },
            include: {
                client: true,
            },
        })
    },
}
