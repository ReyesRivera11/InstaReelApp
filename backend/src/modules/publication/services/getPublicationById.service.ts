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

  return publication;
};