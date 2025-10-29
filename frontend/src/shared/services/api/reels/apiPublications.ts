import type {
  CreateReelsDto,
  Reels,
  ReelsFilters,
  PaginatedReels,
} from "../../../../core/types";
import type { AxiosError } from "axios";
import { axiosInstance } from "../apiBase";
import axios from "axios";

export interface ScheduledReel {
  id: number;
  client_id: number;
  title: string;
  description: string;
  scheduled_date: string;
  container_media_id?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface ReelsResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  Reels?: T;
  reel?: T;
}

interface ErrorResponse {
  message?: string;
  error?: string;
}

class AppReelss {
  async createReels(data: CreateReelsDto): Promise<ReelsResponse<Reels>> {
    try {
      const response = await axiosInstance.post<ReelsResponse<Reels>>(
        "/reels/create",
        data
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        return {
          success: false,
          error:
            axiosError.response?.data?.message ||
            axiosError.response?.data?.error ||
            axiosError.message,
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async getReelss(filters?: ReelsFilters): Promise<PaginatedReels> {
    try {
      const response = await axiosInstance.get<PaginatedReels>("/reels/", {
        params: filters,
      });
      return response.data;
    } catch (error: unknown) {
      console.error("[Axios] Error in getReelss:", error);
      return {
        reels: [],
        total: 0,
        page: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      };
    }
  }

  async getReelsById(id: string): Promise<ReelsResponse<Reels>> {
    try {
      const response = await axiosInstance.get<ReelsResponse<Reels>>(
        `/reels/${id}`
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        return {
          success: false,
          error:
            axiosError.response?.data?.message ||
            axiosError.response?.data?.error ||
            axiosError.message,
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async updateReels(
    id: number,
    data: Partial<CreateReelsDto>
  ): Promise<ReelsResponse<Reels>> {
    try {
      const response = await axiosInstance.put<ReelsResponse<Reels>>(
        `/Reels/${id}`,
        data
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        return {
          success: false,
          error:
            axiosError.response?.data?.message ||
            axiosError.response?.data?.error ||
            axiosError.message,
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async deleteReels(id: string): Promise<ReelsResponse<void>> {
    try {
      const response = await axiosInstance.delete<ReelsResponse<void>>(
        `/reels/${id}`
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        return {
          success: false,
          error:
            axiosError.response?.data?.message ||
            axiosError.response?.data?.error ||
            axiosError.message,
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async scheduleReel(
    formData: FormData
  ): Promise<ReelsResponse<ScheduledReel>> {
    try {
      const response = await axiosInstance.post<ReelsResponse<ScheduledReel>>(
        "/reels/schedule-reel",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        return {
          success: false,
          error:
            axiosError.response?.data?.message ||
            axiosError.response?.data?.error ||
            axiosError.message,
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }
}

export const appReelss = new AppReelss();
