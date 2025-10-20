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
    } catch {
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
      headers: this.getHeaders(),
      credentials: "include" as RequestCredentials,
    };

    let response = await fetch(url, fetchOptions);

    if (response.status === 401) {
      const newToken = await this.handleUnauthorized();
      if (newToken) {
        const headers = {
          ...options.headers,
          Authorization: `Bearer ${newToken}`,
        } as HeadersInit;

        response = await fetch(url, {
          ...options,
          headers,
          credentials: "include" as RequestCredentials,
        });
      }
    }

    return response;
  }

  // Métodos HTTP genéricos
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.fetchWithAuth(`${this.baseURL}${endpoint}`, {
        method: "GET",
      });
      console.log(response);
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
        body: JSON.stringify(data),
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
        body: JSON.stringify(data),
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
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  // Métodos específicos de autenticación
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
    await this.post("/auth/logout");
    localStorage.removeItem("auth_token");
  }

  async getMe(): Promise<ApiResponse<GetMeResponse>> {
    return this.get<GetMeResponse>("/auth/me");
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
    } catch {
      return null;
    }
  }

  // Métodos específicos de clientes
  async createClient(data: CreateClientDTO): Promise<ApiResponse<ClientDB>> {
    return this.post<ClientDB>("/auth/meta/create-account", data);
  }

  async getClients(): Promise<ApiResponse<ClientDB[]>> {
    return this.get<ClientDB[]>("/client/list");
  }

  async deleteClient(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/client/${id}`);
  }

  async initiateInstagramOAuth(
    data: InitiateOAuthRequest
  ): Promise<InitiateOAuthResponse> {
    return this.post<InitiateOAuthResponse>("/client/initiate-oauth", data);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
