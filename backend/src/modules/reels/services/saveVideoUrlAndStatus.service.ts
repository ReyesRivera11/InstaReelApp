import axios from "axios";
import { AppError } from "../../../core/errors/AppError";
import { HttpCode } from "../../../shared/enums/HttpCode";
import { META_API_URLS } from "../../meta/constants/meta.constants";
import { MediaStatusResponse } from "../interfaces/MediaStatus.response";
import { ReelsModel } from "../models/reels.model";

export const saveVideoUrlAndStatusService = async (
  ig_media_id: string,
  access_token: string,
  publication_id: number
) => {
  try {
    const { data } = await axios.get<MediaStatusResponse>(
      META_API_URLS.INSTAGRAM_GRAPH.MEDIA_STATUS(ig_media_id, access_token)
    );

    const { permalink } = data;

    await ReelsModel.updateVideoUrlAndStatus(publication_id, permalink);
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
