import axios from "axios";
import { AppError } from "../../../core/errors/AppError";
import { HttpCode } from "../../../shared/enums/HttpCode";

export class GetReelUrlService {
  static async getReelUrl(
    mediaId: string,
    accessToken: string
  ): Promise<string> {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v24.0/${mediaId}`,
        {
          params: {
            fields: "permalink",
            access_token: accessToken,
          },
        }
      );

      if (!response.data.permalink) {
        throw new Error("No se pudo obtener la URL del reel");
      }

      return response.data.permalink;
    } catch (error) {
      console.error("Error getting reel URL:", error);

      if (axios.isAxiosError(error)) {
        throw new AppError({
          httpCode: HttpCode.INTERNAL_SERVER_ERROR,
          description: `Error obteniendo URL del reel: ${
            error.response?.data?.error?.message || error.message
          }`,
        });
      }

      throw new AppError({
        httpCode: HttpCode.INTERNAL_SERVER_ERROR,
        description: "Error desconocido obteniendo URL del reel",
      });
    }
  }
}
