import type {
  MediaContainerData,
  MediaContainerResponse,
} from "../../../../core/types/meta.Type";

export class MetaApi {
  private readonly graphApiBase = "https://graph.facebook.com";

  async createMediaContainer(
    instagramAccountId: string | undefined,
    data: MediaContainerData
  ): Promise<MediaContainerResponse> {
    try {
      const response = await fetch(
        `${this.graphApiBase}/${instagramAccountId}/media`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.access_token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        let errorMessage = "Error desconocido";
        try {
          const errData = await response.json();
          console.error("[MetaAPI] Error JSON:", errData);
          errorMessage = errData.error?.message || JSON.stringify(errData);
        } catch {
          errorMessage = await response.text();
        }
        throw new Error(errorMessage);
      }

      return (await response.json()) as MediaContainerResponse;
    } catch (error) {
      console.error("❌ Error al crear contenedor de media:", error);
      throw error;
    }
  }
}

export const metaApi = new MetaApi();
