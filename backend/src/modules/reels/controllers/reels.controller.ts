import { Request, Response } from "express";

import { validateSchema } from "../../../shared/utils/zodValidation";
import {
  getFiltersSchema,
  reelsIdSchema,
  scheduleReelSchema,
} from "../schemas/reels.schema";

import {
  getPaginatedReelsService,
  getReelByIdService,
  reelPublishingService,
} from "../services";
import { AppError } from "../../../core/errors/AppError";
import { HttpCode } from "../../../shared/enums/HttpCode";

export class ReelsController {
  static async getReels(req: Request, res: Response) {
    const filters = await validateSchema(getFiltersSchema, req.query);

    const reels = await getPaginatedReelsService(filters);

    res.json(reels);
  }

  static async getReelById(req: Request, res: Response) {
    const { id } = await validateSchema(reelsIdSchema, req.params);

    const reel = await getReelByIdService(id);

    res.json({ reel });
  }

  static async scheduleReel(req: Request, res: Response) {
    const reel = req.file;
    const reelData = await validateSchema(scheduleReelSchema, req.body);

    if(!reel) {
      throw new AppError({
        httpCode: HttpCode.BAD_REQUEST,
        description: "Reel not found",
      })
    }
    
    await reelPublishingService(reelData, reel);

    res.sendStatus(HttpCode.CREATED);
  }
}
