// xPost.controller.ts
import { Request, Response } from "express"
import { xPostSchema } from "../schemas/xPost.schema"
import { XPostService } from "../services/xPost.service"

import { AppError } from "../../../core/errors/AppError"
import { HttpCode } from "../../../shared/enums/HttpCode"

export class XPostController {
    /**
     * Crear post en X
     * - Publicación inmediata
     * - Publicación programada
     */
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

        try {
            /* =========================
               PUBLICACIÓN INMEDIATA
            ========================== */
            if (publish_now || !scheduled_at) {
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

            /* =========================
               PUBLICACIÓN PROGRAMADA
            ========================== */
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
        } catch (error: any) {
            // Si ya es AppError, solo lo relanzamos
            if (error instanceof AppError) {
                throw error
            }

            console.error("XPostController.create error:", error)

            throw new AppError({
                name: "XPostCreateError",
                httpCode: HttpCode.INTERNAL_SERVER_ERROR,
                description: "Error al procesar la publicación en X",
                details: {
                    message: error?.message,
                },
            })
        }
    }
}
