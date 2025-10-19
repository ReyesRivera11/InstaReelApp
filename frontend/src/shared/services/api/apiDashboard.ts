import type { DashboardData } from "../../../core/types/dashboard.types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiDashboard {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async getDashboard(): Promise<ApiResponse<DashboardData>> {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      return {
        success: false,
        error: "No se encontró el token de autenticación",
      };
    }

    try {
      const response = await fetch(`${this.baseURL}/dashboard`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Error ${response.status}: ${errorText}`,
        };
      }

      const json: DashboardData = await response.json();
      return {
        success: true,
        data: json,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }
}

export const apiDashboard = new ApiDashboard(API_BASE_URL);
