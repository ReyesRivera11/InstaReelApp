import { axiosInstance } from "./apiBase";
import type { DashboardData } from "../../../core/types/dashboard.types";
import type { AxiosError } from "axios";
import axios from "axios";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface ErrorResponse {
  message?: string;
  error?: string;
}

class ApiDashboard {
  async getDashboard(): Promise<ApiResponse<DashboardData>> {
    try {
      const response = await axiosInstance.get<DashboardData>("/dashboard");

      return {
        success: true,
        data: response.data,
      };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        if (axiosError.response?.status === 401) {
          localStorage.removeItem("auth_token");
          return {
            success: false,
            error: "Sesión expirada. Por favor, inicia sesión nuevamente.",
          };
        }

        return {
          success: false,
          error:
            axiosError.response?.data?.message ||
            axiosError.response?.data?.error ||
            axiosError.message ||
            `Error del servidor: ${axiosError.response?.status}`,
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }
}

export const apiDashboard = new ApiDashboard();
