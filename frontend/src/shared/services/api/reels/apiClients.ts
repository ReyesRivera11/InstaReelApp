import type {
  AuthResponse,
  ClientDB,
  CreateClientDTO,
  GetMeResponse,
  InitiateOAuthRequest,
  InitiateOAuthResponse,
  User,
  UpdateClientDTO,
} from "../../../../core/types";
import type { AxiosError } from "axios";
import { axiosInstance } from "../apiBase";
import axios from "axios";

export interface ApiResponse<T> {
  user?: User;
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  clients?: ClientDB[];
  client?: ClientDB;
}

interface ErrorResponse {
  message?: string;
  error?: string;
}

class ApiClient {
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

      if (typeof response.data === "string") {
        if (response.data.trim().toUpperCase() === "OK") {
          return {
            success: true,
            message: "Operación completada correctamente",
          } as ApiResponse<T>;
        }
        return {
          success: true,
          message: response.data,
        } as ApiResponse<T>;
      }

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

  async get<T>(
    endpoint: string,
    params?: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    return this.request<T>("GET", endpoint, params);
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>("POST", endpoint, data);
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>("PUT", endpoint, data);
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>("PATCH", endpoint, data);
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>("DELETE", endpoint);
  }

  async upload<T>(
    endpoint: string,
    formData: FormData
  ): Promise<ApiResponse<T>> {
    try {
      const token = localStorage.getItem("auth_token");
      const headers: Record<string, string> = {};

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await axiosInstance.post<T>(endpoint, formData, {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data as ApiResponse<T>;
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

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("auth_token", response.data.accessToken);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        throw new Error(
          axiosError.response?.data?.message || "Error al iniciar sesión"
        );
      }

      if (error instanceof Error) {
        throw error;
      }

      throw new Error("Error desconocido al iniciar sesión");
    }
  }

  async logout(): Promise<void> {
    await this.post("/auth/logout");
    localStorage.removeItem("auth_token");
  }

  async getMe(): Promise<ApiResponse<GetMeResponse>> {
    return this.get<GetMeResponse>("/auth/me");
  }

  async refreshToken(): Promise<{ accessToken: string } | null> {
    try {
      const response = await axiosInstance.post<{ accessToken: string }>(
        "/auth/refresh"
      );
      return response.data;
    } catch {
      return null;
    }
  }

  async createClient(data: CreateClientDTO): Promise<ApiResponse<ClientDB>> {
    return this.post<ClientDB>("/client/create", data);
  }

  async getClientById(id: number): Promise<ApiResponse<{ client: ClientDB }>> {
    return this.get<{ client: ClientDB }>(`/client/${id}`);
  }

  async getClients(): Promise<ApiResponse<ClientDB[]>> {
    return this.get<ClientDB[]>("/client/list");
  }

  async deleteClient(id: number): Promise<ApiResponse<void>> {
    return this.delete<void>(`/client/${id}`);
  }

  async editClient(
    id: number,
    data: UpdateClientDTO
  ): Promise<ApiResponse<ClientDB>> {
    return this.patch<ClientDB>(`/client/${id}`, data);
  }

  async initiateInstagramOAuth(
    data: InitiateOAuthRequest
  ): Promise<InitiateOAuthResponse> {
    const response = await this.post<InitiateOAuthResponse>(
      "/client/initiate-oauth",
      data
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || "Error al iniciar OAuth");
  }
}

export const apiClient = new ApiClient();
