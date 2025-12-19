import { Request, Response, NextFunction } from "express";
import { XPostService } from "../services/xPost.service";
import { xPostSchema } from "../schemas/xPost.schema";
import { AppError } from "../../../core/errors/AppError";
import { HttpCode } from "../../../shared/enums/HttpCode";

export class XPostController {
    static async post(req: Request, res: Response, next: NextFunction) {
        try {
            const clientId = Number(req.params.clientId);

            if (isNaN(clientId)) {
                throw new AppError({
                    httpCode: HttpCode.BAD_REQUEST,
                    description: "Invalid clientId",
                });
            }

            const body = xPostSchema.parse(req.body);

            const result = await XPostService.publishNow(
                clientId,
                body.text
            );

            return res.status(HttpCode.CREATED).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }
}
