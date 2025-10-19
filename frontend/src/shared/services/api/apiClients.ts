import type {
  AuthResponse,
  ClientDB,
  CreateClientDTO,
  GetMeResponse,
  InitiateOAuthRequest,
  InitiateOAuthResponse,
  User,
} from "../../../core/types";

export interface ApiResponse<T> {
  user?: User;
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

class ApiClient {
  private baseURL: string;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem("auth_token");
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  private async handleUnauthorized(): Promise<string | null> {
    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.addRefreshSubscriber((token: string) => {
          resolve(token);
        });
      });
    }

    this.isRefreshing = true;

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to refresh token");
      }

      const data = await response.json();
      const newToken = data.accessToken;

      localStorage.setItem("auth_token", newToken);

      this.onRefreshed(newToken);
      this.isRefreshing = false;

      return newToken;
    } catch (error) {
      console.error("[v0] Token refresh error:", error);
      this.isRefreshing = false;
      localStorage.removeItem("auth_token");
      window.location.href = "/";
      return null;
    }
  }

  private async fetchWithAuth(
    url: string,
    options: RequestInit
  ): Promise<Response> {
    const fetchOptions = {
      ...options,
      credentials: "include" as RequestCredentials,
    };

    let response = await fetch(url, fetchOptions);

    if (response.status === 401) {
      const newToken = await this.handleUnauthorized();

      if (newToken) {
        const headers = { ...options.headers } as Record<string, string>;
        headers["Authorization"] = `Bearer ${newToken}`;
        response = await fetch(url, {
          ...options,
          headers,
          credentials: "include" as RequestCredentials,
        });
      }
    }

    return response;
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.fetchWithAuth(`${this.baseURL}${endpoint}`, {
        method: "GET",
        headers: this.getHeaders(),
        credentials: "include", // Ensure cookies are sent
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await this.fetchWithAuth(`${this.baseURL}${endpoint}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
        credentials: "include", // Ensure cookies are sent
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await this.fetchWithAuth(`${this.baseURL}${endpoint}`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
        credentials: "include", // Ensure cookies are sent
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.fetchWithAuth(`${this.baseURL}${endpoint}`, {
        method: "DELETE",
        headers: this.getHeaders(),
        credentials: "include", // Ensure cookies are sent
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async upload<T>(
    endpoint: string,
    formData: FormData
  ): Promise<ApiResponse<T>> {
    try {
      const token = localStorage.getItem("auth_token");
      const headers: HeadersInit = {};

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await this.fetchWithAuth(`${this.baseURL}${endpoint}`, {
        method: "POST",
        headers,
        body: formData,
        credentials: "include", 
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al iniciar sesión");
      }

      const data = await response.json();

      localStorage.setItem("auth_token", data.accessToken);

      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        throw new Error("No se pudo conectar con el servidor.");
      }
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${this.baseURL}/auth/logout`, {
        method: "POST",
        headers: this.getHeaders(),
        credentials: "include",
      });
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }

  async getMe(): Promise<ApiResponse<GetMeResponse>> {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      return {
        success: false,
        error: "No authentication token found",
      };
    }

    try {
      const response = await this.fetchWithAuth(`${this.baseURL}/auth/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async refreshToken(): Promise<{ accessToken: string } | null> {
    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error("Error refreshing token:", error);
      return null;
    }
  }
  async createClient(data: CreateClientDTO): Promise<ApiResponse<ClientDB>> {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      return {
        success: false,
        error: "No authentication token found",
      };
    }

    try {
      const response = await this.fetchWithAuth(
        `${this.baseURL}/client/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
          credentials: "include",
        }
      );

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }
  async getClients(): Promise<ApiResponse<ClientDB[]>> {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    if (!token) {
      return {
        success: false,
        error: "No authentication token found",
      };
    }

    try {
      const response = await this.fetchWithAuth(`${this.baseURL}/client/list`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }
  async deleteClient(id: string): Promise<ApiResponse<void>> {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    if (!token) {
      return {
        success: false,
        error: "No authentication token found",
      };
    }

    try {
      const response = await this.fetchWithAuth(
        `${this.baseURL}/client/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }
  async initiateInstagramOAuth(
    data: InitiateOAuthRequest
  ): Promise<InitiateOAuthResponse> {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    if (!token) {
      return {
        success: false,
        error: "No authentication token found",
      };
    }

    try {
      const response = await this.fetchWithAuth(
        `${this.baseURL}/client/initiate-oauth`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
          credentials: "include",
        }
      );

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
