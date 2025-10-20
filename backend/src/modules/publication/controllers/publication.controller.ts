import { Request, Response } from "express";

import { validateSchema } from "../../../shared/utils/zodValidation";
import { scheduleReelSchema } from "../schemas/publication.schema";

import { HttpCode } from "../../../shared/enums/HttpCode";

import { scheduleReelService } from "../services";

export class PublicationController {
  static async scheduleReel(req: Request, res: Response) {
    const reelData = await validateSchema(scheduleReelSchema, req.body);

    await scheduleReelService(reelData);

    res.sendStatus(HttpCode.CREATED);
  }
}
