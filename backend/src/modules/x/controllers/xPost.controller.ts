import { Request, Response } from "express";
import { xPostSchema } from "../schemas/xPost.schema";
import { XPostService } from "../services/xPost.service";

import { AppError } from "../../../core/errors/AppError";
import { HttpCode } from "../../../shared/enums/HttpCode";

interface MulterRequest extends Request {
    file?: Express.Multer.File;
}

export class XPostController {
    static async create(req: MulterRequest, res: Response) {
        const parsed = xPostSchema.safeParse(req.body);

        if (!parsed.success) {
            throw new AppError({
                name: "ValidationError",
                httpCode: HttpCode.BAD_REQUEST,
                description: "Datos inválidos para crear el post en X",
                details: parsed.error.flatten(),
            });
        }

        const { publish_now, scheduled_at, client_id, text } = parsed.data;

        const isImmediate = Boolean(publish_now) || !scheduled_at;

        const post = await XPostService.schedule({
            client_id,
            text,
            scheduled_at: isImmediate ? new Date() : scheduled_at,
            media: req.file,
        });

        if (isImmediate) {
            await XPostService.publish(post);

            return res.status(HttpCode.CREATED).json({
                success: true,
                mode: "IMMEDIATE",
                post,
            });
        }

        return res.status(HttpCode.CREATED).json({
            success: true,
            mode: "SCHEDULED",
            post,
        });
    }
}
