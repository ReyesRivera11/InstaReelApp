import { TikTokReelsModel } from "./tiktok-reels.model";
import { TikTokReelStatus } from "@prisma/client";

interface ListParams {
  page: number;
  limit: number;
  search?: string;
  status?: TikTokReelStatus;
  client_id?: number;
}

export class TikTokReelsService {
  /* Crear reel */
  static async createReel(data: {
    client_id: number;
    title: string;
    description?: string;
    video_url: string;
    privacy_level: string;
    scheduled_at: string;
  }) {

    const parsedDate = new Date(data.scheduled_at);

    return TikTokReelsModel.create({
      ...data,
      scheduled_at: parsedDate,
    });
  }

  static async list(params: ListParams) {
    return TikTokReelsModel.list(params);
  }

  /* ================================
     ✏️ Editar
  ================================ */
  static async updateReel(
    id: number,
    data: {
      title?: string;
      description?: string;
      scheduled_at?: string;
    }
  ) {
    const reel = await TikTokReelsModel.findById(id);

    if (!reel) throw new Error("Reel no encontrado");

    if (reel.status !== TikTokReelStatus.SCHEDULED) {
      throw new Error("Solo se pueden editar reels programados");
    }

    return TikTokReelsModel.updateById(id, {
      title: data.title,
      description: data.description,
      scheduled_at: data.scheduled_at
        ? new Date(data.scheduled_at)
        : undefined,
    });
  }

  /* ================================
     🗑️ Eliminar
  ================================ */
  static async deleteReel(id: number) {
    const reel = await TikTokReelsModel.findById(id);

    if (!reel) throw new Error("Reel no encontrado");

    if (reel.status === TikTokReelStatus.PUBLISHED) {
      throw new Error("No se puede eliminar un reel publicado");
    }

    return TikTokReelsModel.deleteById(id);
  }
}
