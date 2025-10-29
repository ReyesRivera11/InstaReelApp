import { AppError } from "../../../core/errors/AppError";
import { HttpCode } from "../../../shared/enums/HttpCode";
import { ReelsModel } from "../models/reels.model";

export const getReelByIdService = async (id: number) => {
  const reel = await ReelsModel.getReelById(id);

  if (!reel) {
    throw new AppError({
      httpCode: HttpCode.NOT_FOUND,
      description: "Reel no encontrado",
    });
  }

  const reelFormatted = {
    id: reel.id,
    status: reel.status,
    title: reel.title,
    description: reel.description,
    video_url: reel.video_url,
    social_identity: reel.social_identity,
    scheduled_date: reel.scheduled_date,
    container_media_id: reel.container_media_id,
    created_at: reel.created_at,
    clientName: reel.client.username,
  };

  return reelFormatted;
};