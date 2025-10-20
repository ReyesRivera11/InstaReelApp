import { scheduleJob } from "node-schedule";

import { ScheduleReel } from "../interfaces/ReelData.interface";

import { AppError } from "../../../core/errors/AppError";
import { HttpCode } from "../../../shared/enums/HttpCode";

import { PublicationModel } from "../models/publication.model";
import { ClientModel } from "../../client/models/client.model";

import { uploadVideoToMetaServerService, publishReelService } from '../services/index'

export const scheduleReelService = async (
  reelData: ScheduleReel,
  reel: Express.Multer.File
) => {
  const { client_id, container_media_id, title, description, scheduled_date } =
    reelData;

  const instagramClient = await ClientModel.getClientById(client_id);

  if (
    !instagramClient ||
    !instagramClient.long_lived_token ||
    !instagramClient.insta_id
  ) {
    throw new AppError({
      httpCode: HttpCode.NOT_FOUND,
      description: "Cliente no encontrado",
    });
  }

  const { long_lived_token, insta_id } = instagramClient;

  const publicationFound = await PublicationModel.getPublicationByMediaId(
    container_media_id
  );

  if (publicationFound) {
    throw new AppError({
      httpCode: HttpCode.CONFLICT,
      description: "La publicación ya existe",
    });
  }

  const { id: publication_id } = await PublicationModel.create(
    client_id,
    container_media_id,
    title,
    scheduled_date,
    description
  );

  await uploadVideoToMetaServerService(container_media_id, instagramClient.long_lived_token, reel);

  scheduleJob(reelData.scheduled_date, async () => {
    await publishReelService(
      insta_id,
      container_media_id,
      publication_id,
      long_lived_token,
    );
  });
};
