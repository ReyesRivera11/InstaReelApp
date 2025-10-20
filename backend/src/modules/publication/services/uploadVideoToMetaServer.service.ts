import axios from "axios";
import { META_API_URLS } from "../../meta/constants/meta.constants";
import { UploadVideoResponse } from "../interfaces/UploadVideo.response";
import { AppError } from "../../../core/errors/AppError";
import { HttpCode } from "../../../shared/enums/HttpCode";

export const uploadVideoToMetaServerService = async (
  container_media_id: string,
  access_token: string,
  reel: Express.Multer.File
) => {
  try {
    await axios.post<UploadVideoResponse>(
      META_API_URLS.INSTAGRAM_GRAPH.MEDIA_UPLOAD(container_media_id),
      reel.buffer,
      {
        headers: {
          Authorization: `OAuth ${access_token}`,
          offset: "0",
          file_size: `${reel.size.toString()}`,
        },
      }
    );
  } catch (error) {
    if (error instanceof axios.AxiosError && error.response?.status === 400) {
      throw new AppError({
        httpCode: HttpCode.BAD_REQUEST,
        description: error.message,
      });
    }

    throw error;
  }
};
