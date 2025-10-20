import { Request, Response } from "express";

import { validateSchema } from "../../../shared/utils/zodValidation";
import { scheduleReelSchema } from "../schemas/publication.schema";

import { HttpCode } from "../../../shared/enums/HttpCode";

import { scheduleReelService } from "../services";
import { AppError } from "../../../core/errors/AppError";

export class PublicationController {
  static async scheduleReel(req: Request, res: Response) {
    const reel = req.file;
    const reelData = await validateSchema(scheduleReelSchema, req.body);

    if (!reel) {
      throw new AppError({
        httpCode: HttpCode.BAD_REQUEST,
        description: "Reel no proporcionado",
      });
    }

    await scheduleReelService(reelData, reel);

    res.sendStatus(HttpCode.CREATED);
  }
}
