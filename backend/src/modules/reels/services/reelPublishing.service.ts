import { ScheduleReel } from "../interfaces/ReelData.interface";

import { AppError } from "../../../core/errors/AppError";
import { HttpCode } from "../../../shared/enums/HttpCode";

import { ReelsModel } from "../models/reels.model";
import { ClientModel } from "../../client/models/client.model";

import { ReelStrategyFactory } from "../factories/reelStrategy.factory";
import { ReelPublishingData } from "../interfaces/ReelStrategy.interface";

export const reelPublishingService = async (
  reelData: ScheduleReel,
  reelFile: Express.Multer.File
) => {
  const {
    client_id,
    title,
    description,
    scheduled_date,
    social_identity,
    page_access_token,
    target_id,
  } = reelData;

  // Validate client
  const client = await ClientModel.getClientById(client_id);
  if (!client?.long_lived_token || !client?.insta_id) {
    throw new AppError({
      httpCode: HttpCode.NOT_FOUND,
      description: "Cliente no encontrado o sin token válido",
    });
  }

  // Access token and target id based on red social
  let accessToken: string;
  let targetId: string;

  // Check red social
  if (social_identity === "INSTAGRAM") {
    if (!client.long_lived_token || !client.insta_id) {
      throw new AppError({
        httpCode: HttpCode.BAD_REQUEST,
        description: "Cliente no tiene token de Instagram válido",
      });
    }
    accessToken = client.long_lived_token;
    targetId = client.insta_id;
  } else if (social_identity === "FACEBOOK") {
    if (!page_access_token || !target_id) {
      throw new AppError({
        httpCode: HttpCode.BAD_REQUEST,
        description: "Se requiere page_access_token y target_id para Facebook",
      });
    }
    accessToken = page_access_token;
    targetId = target_id;
  } else {
    throw new AppError({
      httpCode: HttpCode.BAD_REQUEST,
      description: "Red social no soportada",
    });
  }

  // Create strategy based on red social
  const strategy = ReelStrategyFactory.createStrategy(social_identity);

  // Create publishing data
  const publishingData: ReelPublishingData = {
    clientId: client_id,
    title,
    description,
    scheduledDate: new Date(scheduled_date),
    accessToken: accessToken,
    socialIdentity: social_identity,
    videoFile: reelFile,
    targetId: targetId,
  };

  let containerId: string;
  let reelId: number | undefined = undefined;

  try {
    // Create container and schedule publishing
    containerId = await strategy.createContainer(publishingData);

    const result = await ReelsModel.create(
      client_id,
      containerId,
      title,
      social_identity,
      scheduled_date,
      description
    );

    reelId = result.id;

    const publishingResult = await strategy.schedulePublishing(
      containerId,
      publishingData,
      reelId
    );

    if (!publishingResult.success) {
      throw new AppError({
        httpCode: HttpCode.INTERNAL_SERVER_ERROR,
        description:
          publishingResult.error || "Error al programar la publicación",
      });
    }
  } catch (error) {
    if (reelId) {
      await ReelsModel.deleteReel(reelId);
    }

    if (error instanceof AppError) throw error;
  }
};
