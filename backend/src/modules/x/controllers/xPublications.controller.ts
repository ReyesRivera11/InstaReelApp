import { Request, Response } from "express"
import { XPublicationsService } from "../services/xPublications.service"
import { AppError } from "../../../core/errors/AppError"
import { HttpCode } from "../../../shared/enums/HttpCode"

export class XPublicationsController {
    static async list(req: Request, res: Response) {
        const page = Number(req.query.page ?? 1)
        const limit = Number(req.query.limit ?? 10)
        const search = req.query.search as string | undefined
        const status = req.query.status as "SCHEDULED" | "PUBLISHED" | undefined

        const data = await XPublicationsService.list({
            page,
            limit,
            search,
            status,
        })

        return res.status(HttpCode.OK).json(data)
    }

    static async detail(req: Request, res: Response) {
        const id = Number(req.params.id)

        if (Number.isNaN(id)) {
            throw new AppError({
                name: "ValidationError",
                httpCode: HttpCode.BAD_REQUEST,
                description: "ID inválido",
            })
        }

        const publication = await XPublicationsService.detail(id)

        if (!publication) {
            throw new AppError({
                name: "NotFound",
                httpCode: HttpCode.NOT_FOUND,
                description: "Publicación no encontrada",
            })
        }

        return res.status(HttpCode.OK).json({ publication })
    }
}
