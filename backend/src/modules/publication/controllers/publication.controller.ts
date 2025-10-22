import { Request, Response } from "express";

import { validateSchema } from "../../../shared/utils/zodValidation";
import {
  publicationFiltersSchema,
  publicationIdSchema,
  scheduleReelSchema,
} from "../schemas/publication.schema";

import { HttpCode } from "../../../shared/enums/HttpCode";
import { AppError } from "../../../core/errors/AppError";

import {
  getPublicationByIdService,
  getPublicationsService,
  scheduleReelService,
} from "../services";

export class PublicationController {
  static async getPublications(req: Request, res: Response) {
    const filters = await validateSchema(publicationFiltersSchema, req.query);

    const result = await getPublicationsService(filters);

    res.json(result);
  }

  static async getPublicationById(req: Request, res: Response) {
    const { id } = await validateSchema(publicationIdSchema, req.params);

    const publication = await getPublicationByIdService(id);

    res.json({ publication });
  }

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
