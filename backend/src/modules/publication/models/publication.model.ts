import { Prisma } from "@prisma/client";
import prisma from "../../../shared/lib/prisma";
import { AppError } from "../../../core/errors/AppError";
import { HttpCode } from "../../../shared/enums/HttpCode";

export class PublicationModel {
  static async create(
    client_id: number,
    container_media_id: string,
    title: string,
    scheduled_date: Date,
    description?: string
  ) {
    try {
      const newPublication = await prisma.instagram_reels.create({
        data: {
          client_id,
          container_media_id,
          title,
          description,
          scheduled_date,
        },
      });

      return newPublication;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new AppError({
          httpCode: HttpCode.CONFLICT,
          description: "Error al crear la publicación",
        });
      }

      throw error;
    }
  }

  static async getPublicationByMediaId(media_id: string) {
    const publication = await prisma.instagram_reels.findUnique({
      where: { container_media_id: media_id },
    });

    return publication;
  }

  static async updateVideoUrlAndStatus(
    publication_id: number,
    video_url: string
  ) {
    try {
      await prisma.instagram_reels.update({
        where: { id: publication_id },
        data: {
          video_url,
          status: "PUBLISHED",
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new AppError({
          httpCode: HttpCode.CONFLICT,
          description: "Error al actualizar el estado de la publicación",
        });
      }

      throw error;
    }
  }
}
