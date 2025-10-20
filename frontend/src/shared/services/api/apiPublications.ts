import type { CreatePublicationDto, Publication } from "../../../core/types";

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

    const response = await fetch(url, fetchOptions);

    if (response.status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/";
    }

    return response;
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

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async getPublications(): Promise<PublicationResponse<Publication[]>> {
    try {
      const response = await this.fetchWithAuth(
        `${this.baseURL}/publication/list`,
        {
          method: "GET",
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

      return await response.json();
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

      return await response.json();
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

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }
}

export const appPublications = new AppPublications(API_BASE_URL);
