import { Prisma } from "@prisma/client";
import prisma from "../../../shared/lib/prisma";

import { AppError } from "../../../core/errors/AppError";
import { HttpCode } from "../../../shared/enums/HttpCode";

import { PublicationFilters } from "../interfaces/PublicationFilters.interface";

export class PublicationModel {
  static async getPublicationByMediaId(media_id: string) {
    const publication = await prisma.instagram_reels.findUnique({
      where: { container_media_id: media_id },
    });

    return publication;
  }

  static async getPaginatedPublications(filters: PublicationFilters) {
    const { search = "", status, page = 1, limit = 10 } = filters;

    const skip = (page - 1) * limit;

    // Build where
    const where: any = {};

    // Filter by search
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { client: { name: { contains: search } } },
      ];
    }

    // Filter by status
    if (status) {
      where.status = status.toUpperCase();
    }

    // Get publications
    const [publications, total] = await Promise.all([
      prisma.instagram_reels.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        include: {
          client: {
            select: {
              name: true,
              username: true,
            },
          },
        },
      }),
      prisma.instagram_reels.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    // Format publications
    const formattedPublications = publications.map((pub) => ({
      id: pub.id,
      title: pub.title,
      description: pub.description,
      clientName: pub.client.name,
      scheduled_date: pub.scheduled_date,
      status: pub.status as "scheduled" | "published",
      media_url: pub.video_url,
      published_at: pub.scheduled_date,
      created_at: pub.created_at,
    }));

    return {
      publications: formattedPublications,
      total,
      page,
      totalPages,
      hasNext,
      hasPrev,
    };
  }

  static async getPublicationById(id: number) {
    const publication = await prisma.instagram_reels.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            username: true
          },
        },
      },
      omit: {
        client_id: true
      }
    });

    return publication;
  }

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
