import { Request, Response } from "express"
import { xPostSchema } from "../schemas/xPost.schema"
import { XPostService } from "../services/xPost.service"

import { AppError } from "../../../core/errors/AppError"
import { HttpCode } from "../../../shared/enums/HttpCode"

export class XPostController {
    static async create(req: Request, res: Response) {
        const parsed = xPostSchema.safeParse(req.body)

        if (!parsed.success) {
            throw new AppError({
                name: "ValidationError",
                httpCode: HttpCode.BAD_REQUEST,
                description: "Datos inválidos para crear el post en X",
                details: parsed.error.flatten(),
            })
        }

        const { publish_now, scheduled_at, client_id, text } = parsed.data

        // inmediato si publish_now o si no mandan scheduled_at
        const isImmediate = Boolean(publish_now) || !scheduled_at

        if (isImmediate) {
            const post = await XPostService.publishImmediate({
                client_id,
                text,
                media: req.file,
            })

            return res.status(HttpCode.CREATED).json({
                success: true,
                mode: "IMMEDIATE",
                post,
            })
        }

        const post = await XPostService.schedule({
            client_id,
            text,
            scheduled_at,
            media: req.file,
        })

        return res.status(HttpCode.CREATED).json({
            success: true,
            mode: "SCHEDULED",
            post,
        })
    }
}
