import type {
  MediaContainerData,
  MediaContainerResponse,
  UploadHeaders,
  UploadResponse,
} from "../../../core/types/meta.Type";

export class MetaApi {
  private readonly graphApiBase = "https://graph.facebook.com";

  async createMediaContainer(
    instagramAccountId: string,
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
          if (errData.error?.message) {
            errorMessage = errData.error.message;
          } else {
            errorMessage = JSON.stringify(errData);
          }
        } catch {
          const errText = await response.text();
          errorMessage = errText;
        }

        throw new Error(errorMessage);
      }

      return (await response.json()) as MediaContainerResponse;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async uploadVideoBinary(
    uploadUrl: string,
    token: string,
    file: Blob | ArrayBuffer,
    fileSize: number
  ): Promise<UploadResponse> {
    try {
      const headers: UploadHeaders = {
        Authorization: `OAuth ${token}`,
        offset: "0",
        file_size: String(fileSize),
        "Content-Type": "application/octet-stream",
      };

      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: headers,
        body: file,
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Error subiendo video: ${response.status} - ${err}`);
      }

      return (await response.json()) as UploadResponse;
    } catch (error) {
      console.error("Error subiendo video a rupload:", error);
      throw error;
    }
  }
}

export const metaApi = new MetaApi();
