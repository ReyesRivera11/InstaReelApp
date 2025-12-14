import { Prisma, SocialIdentity } from "@prisma/client";
import prisma from "../../../shared/lib/prisma";

import { AppError } from "../../../core/errors/AppError";
import { HttpCode } from "../../../shared/enums/HttpCode";
import { GetReelsFilters } from "../interfaces/GetReelsFilters.interface";

export class ReelsModel {
  static async findReelByContainerId(containerMediaId: string) {
    try {
      const reel = await prisma.reels.findFirst({
        where: {
          OR: [
            { container_media_id: containerMediaId },
            { container_media_id: { contains: containerMediaId } },
          ],
        },
      });

      return reel;
    } catch (error) {
      console.error("Error finding reel by container ID:", error);
      return null;
    }
  }

  static async getPaginatedReels(filters: GetReelsFilters) {
    const {
      search = "",
      status,
      page = 1,
      limit = 10,
      social_identity,
    } = filters;

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

    // Filter by social identity
    if (social_identity) {
      where.social_identity = social_identity;
    }

    // Get reels
    const [reels, total] = await Promise.all([
      prisma.reels.findMany({
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
      prisma.reels.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    // Format reels
    const formattedReels = reels.map((reel) => ({
      id: reel.id,
      title: reel.title,
      description: reel.description,
      clientName: reel.client.name,
      scheduled_date: reel.scheduled_date,
      status: reel.status as "scheduled" | "published",
      media_url: reel.video_url,
      published_at: reel.scheduled_date,
      created_at: reel.created_at,
    }));

    return {
      reels: formattedReels,
      total,
      page,
      totalPages,
      hasNext,
      hasPrev,
    };
  }

  static async getReelById(id: number) {
    const reel = await prisma.reels.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            username: true,
          },
        },
      },
      omit: {
        client_id: true,
      },
    });

    return reel;
  }

  static async create(
    client_id: number,
    container_media_id: string,
    title: string,
    social_identity: SocialIdentity,
    scheduled_date: Date,
    description?: string
  ) {
    try {
      const newPublication = await prisma.reels.create({
        data: {
          client_id,
          social_identity,
          container_media_id,
          title,
          description,
          scheduled_date,
        },
      });

      return newPublication;
    } catch (error) {
      console.log({ error });
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new AppError({
          httpCode: HttpCode.CONFLICT,
          description: "Error al crear la publicación",
        });
      }

      throw error;
    }
  }

  static async updateReelAfterPublishing(
    reelId: number,
    reelUrl: string,
    mediaId?: string
  ) {
    try {
      const updatedReel = await prisma.reels.update({
        where: { id: reelId },
        data: {
          status: "PUBLISHED",
          video_url: reelUrl,
          ...(mediaId && { container_media_id: mediaId }),
        },
      });

      return updatedReel;
    } catch (error) {
      console.error("Error updating reel after publishing:", error);
      throw error;
    }
  }

  static async deleteReel(reelId: number) {
    try {
      await prisma.reels.delete({
        where: { id: reelId },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new AppError({
            httpCode: HttpCode.CONFLICT,
            description: `No se encontró un reel con el ID ${reelId} para eliminar`,
          })
        }
      }
    }
  }
}
