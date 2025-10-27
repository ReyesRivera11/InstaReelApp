import type {
  CreatePublicationDto,
  Publication,
  PublicationFilters,
  PaginatedPublications,
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

export interface PublicationResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  publication?: T;
}

interface ErrorResponse {
  message?: string;
  error?: string;
}

class AppPublications {
  async createPublication(
    data: CreatePublicationDto
  ): Promise<PublicationResponse<Publication>> {
    try {
      const response = await axiosInstance.post<
        PublicationResponse<Publication>
      >("/publication/create", data);
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

  async getPublications(
    filters?: PublicationFilters
  ): Promise<PaginatedPublications> {
    try {
      const response = await axiosInstance.get<PaginatedPublications>(
        "/publication",
        { params: filters }
      );
      return response.data;
    } catch (error: unknown) {
      console.error("[Axios] Error in getPublications:", error);
      return {
        publications: [],
        total: 0,
        page: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      };
    }
  }

  async getPublicationById(
    id: string
  ): Promise<PublicationResponse<Publication>> {
    try {
      const response = await axiosInstance.get<
        PublicationResponse<Publication>
      >(`/publication/${id}`);
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

  async updatePublication(
    id: number,
    data: Partial<CreatePublicationDto>
  ): Promise<PublicationResponse<Publication>> {
    try {
      const response = await axiosInstance.put<
        PublicationResponse<Publication>
      >(`/publication/${id}`, data);
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

  async deletePublication(id: string): Promise<PublicationResponse<void>> {
    try {
      const response = await axiosInstance.delete<PublicationResponse<void>>(
        `/publication/${id}`
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
  ): Promise<PublicationResponse<ScheduledReel>> {
    try {
      const response = await axiosInstance.post<
        PublicationResponse<ScheduledReel>
      >("/publication/schedule-reel", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
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

export const appPublications = new AppPublications();
