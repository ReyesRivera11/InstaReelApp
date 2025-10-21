import type {
  CreatePublicationDto,
  Publication,
  PublicationFilters,
  PaginatedPublications,
} from "../../../core/types";

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
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

class AppPublications {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async fetchWithAuth(
    url: string,
    options: RequestInit
  ): Promise<Response> {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const fetchOptions = {
      ...options,
      headers,
      credentials: "include" as RequestCredentials,
    };

    try {
      const response = await fetch(url, fetchOptions);

      if (response.status === 401) {
        localStorage.removeItem("auth_token");
        window.location.href = "/";
      }

      return response;
    } catch (error) {
      console.error("[v0] Fetch error:", error);
      throw new Error("Error de conexión con el servidor");
    }
  }

  private async parseResponse<T>(
    response: Response
  ): Promise<PublicationResponse<T>> {
    const contentType = response.headers.get("content-type");

    if (!contentType || !contentType.includes("application/json")) {
      console.error("[v0] Non-JSON response received:", contentType);
      return {
        success: false,
        error:
          "El servidor no respondió correctamente. Por favor, verifica que la API esté funcionando.",
      };
    }

    if (!response.ok) {
      try {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || `Error del servidor: ${response.status}`,
        };
      } catch {
        return {
          success: false,
          error: `Error del servidor: ${response.status} ${response.statusText}`,
        };
      }
    }

    try {
      return await response.json();
    } catch (error) {
      console.error("[v0] JSON parse error:", error);
      return {
        success: false,
        error: "Error al procesar la respuesta del servidor",
      };
    }
  }

  async createPublication(
    data: CreatePublicationDto
  ): Promise<PublicationResponse<Publication>> {
    try {
      const response = await this.fetchWithAuth(
        `${this.baseURL}/publication/create`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      return await this.parseResponse<Publication>(response);
    } catch (error) {
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
      const params = new URLSearchParams();

      if (filters?.search) params.append("search", filters.search);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());

      const queryString = params.toString();
      const url = `${this.baseURL}/publication${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await this.fetchWithAuth(url, {
        method: "GET",
      });

      const contentType = response.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
        console.error("[v0] Non-JSON response received:", contentType);
        return {
          publications: [],
          total: 0,
          page: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        };
      }

      if (!response.ok) {
        console.error("[v0] API error:", response.status);
        return {
          publications: [],
          total: 0,
          page: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        };
      }

      const data = await response.json();
      return data as PaginatedPublications;
    } catch (error) {
      console.error("[v0] Error in getPublications:", error);
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
      const response = await this.fetchWithAuth(
        `${this.baseURL}/publication/${id}`,
        {
          method: "GET",
        }
      );

      return await this.parseResponse<Publication>(response);
    } catch (error) {
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
      const response = await this.fetchWithAuth(
        `${this.baseURL}/publication/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      );

      return await this.parseResponse<Publication>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async deletePublication(id: string): Promise<PublicationResponse<void>> {
    try {
      const response = await this.fetchWithAuth(
        `${this.baseURL}/publication/${id}`,
        {
          method: "DELETE",
        }
      );

      return await this.parseResponse<void>(response);
    } catch (error) {
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
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token")
          : null;

      const headers: HeadersInit = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const response = await fetch(
        `${this.baseURL}/publication/schedule-reel`,
        {
          method: "POST",
          headers,
          body: formData,
          credentials: "include" as RequestCredentials,
        }
      );

      return await this.parseResponse<ScheduledReel>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }
}

export const appPublications = new AppPublications(API_BASE_URL);
