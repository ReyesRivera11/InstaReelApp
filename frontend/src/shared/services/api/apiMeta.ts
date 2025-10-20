import type {
  MediaContainerData,
  MediaContainerResponse,
} from "../../../core/types/meta.Type";

export class MetaApi {
  private readonly graphApiBase = "https://graph.facebook.com";

  // ✅ Crea el contenedor de media (igual que antes)
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

  // // ✅ Subida binaria con progreso en tiempo real
  // async uploadVideoBinary(
  //   uploadUrl: string,
  //   token: string | undefined,
  //   file: Blob | File,
  //   fileSize: number,
  //   onProgress?: (percent: number) => void
  // ): Promise<UploadResponse> {
  //   return new Promise((resolve, reject) => {
  //     try {
  //       const xhr = new XMLHttpRequest();
  //       xhr.open("POST", uploadUrl, true);

  //       // 📦 Headers de rupload (igual que tu versión previa)
  //       xhr.setRequestHeader("Authorization", `OAuth ${token}`);
  //       xhr.setRequestHeader("offset", "0");
  //       xhr.setRequestHeader("file_size", String(fileSize));
  //       xhr.setRequestHeader("Content-Type", "application/octet-stream");

  //       // 📊 Progreso en tiempo real
  //       xhr.upload.onprogress = (event) => {
  //         if (event.lengthComputable && onProgress) {
  //           const percent = Math.round((event.loaded / event.total) * 100);
  //           onProgress(percent);
  //         }
  //       };

  //       // ✅ Subida completada
  //       xhr.onload = () => {
  //         if (xhr.status >= 200 && xhr.status < 300) {
  //           try {
  //             const json: UploadResponse = JSON.parse(xhr.responseText);
  //             resolve(json);
  //           } catch {
  //             resolve({ success: true } as UploadResponse);
  //           }
  //         } else {
  //           reject(
  //             new Error(
  //               `Error subiendo video: ${xhr.status} - ${xhr.statusText}`
  //             )
  //           );
  //         }
  //       };

  //       // ❌ Error de red
  //       xhr.onerror = () => {
  //         reject(new Error("Error de red al subir el video"));
  //       };

  //       // 🚀 Enviar archivo binario directo
  //       xhr.send(file);
  //     } catch (err) {
  //       console.error("Error en uploadVideoBinary:", err);
  //       reject(err);
  //     }
  //   });
  // }
}

export const metaApi = new MetaApi();
