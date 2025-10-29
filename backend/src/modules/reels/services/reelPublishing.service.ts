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
  } = reelData;

  // Validate client
  const client = await ClientModel.getClientById(client_id);
  if (!client?.long_lived_token || !client?.insta_id) {
    throw new AppError({
      httpCode: HttpCode.NOT_FOUND,
      description: "Cliente no encontrado o sin token válido",
    });
  }

  const strategy = ReelStrategyFactory.createStrategy(social_identity);

  // Preparar datos para publicación
  const publishingData: ReelPublishingData = {
    clientId: client_id,
    title,
    description,
    scheduledDate: new Date(scheduled_date),
    accessToken: client.long_lived_token,
    socialIdentity: social_identity,
    videoFile: reelFile,
    instagramId: client.insta_id, // Usamos el insta_id para ambas redes
  };

  let containerId: string;
  let reelId: number;

  try {
    // 1. Crear contenedor en la red social
    containerId = await strategy.createContainer(publishingData);

    // 2. Crear registro en BD con el containerId generado
    const result = await ReelsModel.create(
      client_id,
      containerId, // Ahora usamos el containerId generado por el backend
      title,
      social_identity,
      scheduled_date,
      description
    );

    reelId = result.id;

    // 3. Programar publicación usando la estrategia
    const publishingResult = await strategy.schedulePublishing(
      containerId,
      publishingData
    );

    if (!publishingResult.success) {
      // Revertir creación en BD si falla
      throw new AppError({
        httpCode: HttpCode.INTERNAL_SERVER_ERROR,
        description:
          publishingResult.error || "Error al programar la publicación",
      });
    }
    return {

      reelId,
      containerId,
      scheduledTime: publishingResult.scheduledTime,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;

    throw new AppError({
      httpCode: HttpCode.INTERNAL_SERVER_ERROR,
      description:
        error instanceof Error
          ? error.message
          : "Error desconocido al programar el reel",
    });
  }
};
