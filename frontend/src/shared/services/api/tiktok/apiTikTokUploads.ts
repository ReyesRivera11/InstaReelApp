import type { AxiosError } from "axios";
import { axiosMultipartInstance } from "./apiMultipart";

interface UploadResponse {
  success: boolean;
  video_url?: string;
  error?: string;
}

export const apiTikTokUploads = {
  async uploadVideo(file: File): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append("reel", file);

      const response = await axiosMultipartInstance.post(
        "/tiktok/uploads/video",
        formData
      );

      // El backend devuelve objeto o array
      const data = Array.isArray(response.data)
        ? response.data[0]
        : response.data;

      return {
        success: data.success,
        video_url: data.video_url,
      };
    } catch (error) {
      const err = error as AxiosError<{ error?: string }>;
      return {
        success: false,
        error:
          err.response?.data?.error ||
          err.message ||
          "Error al subir el video",
      };
    }
  },
};
