import type { AxiosError } from "axios";
import { axiosInstance } from "../apiBase";

/* ================================
   Tipos
================================ */

export interface TikTokReel {
  id: number;
  client_id: number;
  title: string;
  description?: string;
  video_url?: string;
  scheduled_at?: string;
  published_at?: string;
  status: string;
  created_at?: string;
}


export interface TikTokCreatorInfo {
  creator_username: string;
  creator_nickname?: string;
  creator_avatar_url?: string;
  privacy_level_options: string[];
  comment_disabled: boolean;
  duet_disabled: boolean;
  stitch_disabled: boolean;
  max_video_post_duration_sec: number;
}

export interface TikTokCreatorInfoResponse {
  success: boolean;
  data: TikTokCreatorInfo;
}

interface PaginatedTikTokReels {
  success: boolean;
  data: {
    reels: TikTokReel[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ErrorResponse {
  message?: string;
  error?: string;
}

/* ================================
   API TikTok Reels
================================ */

class ApiTikTokReels {
  /* ======================================================
     🔴 NUEVO — OBTENER creator_info (OBLIGATORIO TIKTOK)
     ====================================================== */
  async getCreatorInfo(data: {
    client_id: number;
  }): Promise<TikTokCreatorInfoResponse> {
    const response = await axiosInstance.post(
      "/tiktok/creator_info",
      data
    );

    return response.data;
  }


  /* ======================================================
     Programar / Publicar reel (AMPLIADO)
     ====================================================== */
  async scheduleReel(data: {
    client_id: number;
    title: string;
    description?: string;
    video_url: string;

    // 🔽 Obligatorios por TikTok
    privacy_level: string;
    allow_comment: boolean;
    allow_duet: boolean;
    allow_stitch: boolean;

    // 🔽 Commercial content
    is_commercial: boolean;
    brand_self: boolean;
    brand_third_party: boolean;

    scheduled_at: string;

  }) {
    try {
      const response = await axiosInstance.post("/tiktok/reels", data);
      return response.data;
    } catch (error: unknown) {
      const err = error as AxiosError<ErrorResponse>;
      return {
        success: false,
        error:
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message,
      };
    }
  }

  /* ======================================================
     LISTAR reels
     ====================================================== */
  async getScheduledReels(params?: {
    page?: number;
    limit?: number;
    client_id?: number;
    search?: string;
    status?: string;
  }): Promise<PaginatedTikTokReels> {
    const response = await axiosInstance.get("/tiktok/reels", {
      params,
    });
    return response.data;
  }

  /* ======================================================
     OBTENER reel por ID
     ====================================================== */
  async getReelById(id: number) {
    const response = await axiosInstance.get(`/tiktok/reels/${id}`);
    return response.data;
  }

  /* ======================================================
     Eliminar reel
     ====================================================== */
  async deleteReel(id: number) {
    const response = await axiosInstance.delete(`/tiktok/reels/${id}`);
    return response.data;
  }

  /* ======================================================
     Actualizar reel
     ====================================================== */
  async updateReel(
    id: number,
    data: {
      title: string;
      description?: string;
      scheduled_at?: string;
    }
  ) {
    try {
      const response = await axiosInstance.put(
        `/tiktok/reels/${id}`,
        data
      );
      return response.data;
    } catch {
      return {
        success: false,
        error: "Error al actualizar reel de TikTok",
      };
    }
  }
}

export const apiTikTokReels = new ApiTikTokReels();
