import prisma from "../../../shared/lib/prisma";
import { TikTokReelStatus, Prisma } from "@prisma/client";

interface ListParams {
  page: number;
  limit: number;
  search?: string;
  status?: TikTokReelStatus;
  client_id?: number;
}

export class TikTokReelsModel {
  static create(data: {
    client_id: number;
    title: string;
    description?: string;
    video_url: string;
    privacy_level: string;
    scheduled_at: Date;
  }) {
    return prisma.tiktok_reels.create({
      data: {
        ...data,
        status: TikTokReelStatus.SCHEDULED,
      },
    });
  }

  static findById(id: number) {
    return prisma.tiktok_reels.findUnique({ where: { id } });
  }

  static updateById(
    id: number,
    data: {
      title?: string;
      description?: string;
      scheduled_at?: Date;
    }
  ) {
    return prisma.tiktok_reels.update({
      where: { id },
      data,
    });
  }

  static deleteById(id: number) {
    return prisma.tiktok_reels.delete({ where: { id } });
  }

  static async list({ page, limit, search, status, client_id }: ListParams) {
    const skip = (page - 1) * limit;
    const where: Prisma.tiktok_reelsWhereInput = {};

    if (status) where.status = status;
    if (client_id) where.client_id = client_id;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { client: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [reels, total] = await Promise.all([
      prisma.tiktok_reels.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduled_at: "desc" },
        include: { client: { select: { id: true, name: true } } },
      }),
      prisma.tiktok_reels.count({ where }),
    ]);

    return { reels, total };
  }
}
