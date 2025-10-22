import { AppError } from "../../../core/errors/AppError";
import { HttpCode } from "../../../shared/enums/HttpCode";
import { PublicationModel } from "../models/publication.model";

export const getPublicationByIdService = async (id: number) => {
  const publication = await PublicationModel.getPublicationById(id);

  if (!publication) {
    throw new AppError({
      httpCode: HttpCode.NOT_FOUND,
      description: "Publicación no encontrada",
    });
  }

  const publicationFormatted = {
    id: publication.id,
    status: publication.status,
    title: publication.title,
    description: publication.description,
    video_url: publication.video_url,
    scheduled_date: publication.scheduled_date,
    container_media_id: publication.container_media_id,
    created_at: publication.created_at,
    clientName: publication.client.username,
  };

  return publicationFormatted;
};