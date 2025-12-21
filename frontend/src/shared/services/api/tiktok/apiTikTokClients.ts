import type {
  ClientDB,
  PaginatedClients,
  ClientFilters,
  UpdateClientDTO,
} from "../../../../core/types";
import type { AxiosError } from "axios";
import axios from "axios";
import { axiosInstance } from "../apiBase";

/* ================================
   Tipos base
================================ */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface ErrorResponse {
  message?: string;
  error?: string;
}

/* ================================
   API TikTok Clients
================================ */

class ApiTikTokClients {
  private async request<T>(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    endpoint: string,
    data?: unknown
  ): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance({
        method,
        url: endpoint,
        data: method !== "GET" ? data : undefined,
        params: method === "GET" ? data : undefined,
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

  /* ---------- helpers ---------- */

  private get<T>(
    endpoint: string,
    params?: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    return this.request<T>("GET", endpoint, params);
  }

  private patch<T>(
    endpoint: string,
    data?: unknown
  ): Promise<ApiResponse<T>> {
    return this.request<T>("PATCH", endpoint, data);
  }

  private deleteReq<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>("DELETE", endpoint);
  }

  /* ================================
     TikTok – Clientes
  ================================ */

  async getClients(
    filters?: Omit<ClientFilters, "social_identity">
  ): Promise<PaginatedClients> {
    const params: Record<string, unknown> = {};

    if (filters?.page) params.page = filters.page;
    if (filters?.limit) params.limit = filters.limit;
    if (filters?.search) params.search = filters.search;

    // ✅ endpoint real del backend
    const response = await this.get<PaginatedClients>(
      "/tiktok/clients",
      params
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || "Error al cargar clientes de TikTok");
  }

  async getClientById(id: number): Promise<ApiResponse<{ client: ClientDB }>> {
    return this.get<{ client: ClientDB }>(`/tiktok/clients/${id}`);
  }

  async updateClient(
    id: number,
    data: UpdateClientDTO
  ): Promise<ApiResponse<ClientDB>> {
    return this.patch<ClientDB>(`/tiktok/clients/${id}`, data);
  }

  async deleteClient(id: number): Promise<ApiResponse<void>> {
    return this.deleteReq<void>(`/tiktok/clients/${id}`);
  }
}

/* ================================
   Export
================================ */

export const apiTikTokClients = new ApiTikTokClients();
