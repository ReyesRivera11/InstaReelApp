import axios from "axios";
import { AppError } from "../../../core/errors/AppError";
import { HttpCode } from "../../../shared/enums/HttpCode";

import { META_API_URLS } from "../../meta/constants/meta.constants";
import { saveVideoUrlAndStatusService } from "./saveVideoUrlAndStatus.service";

import { PublishedReelResponse } from "../interfaces/PublishedReel.response";

export const publishReelService = async (
  instagram_id: string,
  container_media_id: string,
  publication_id: number,
  access_token: string
) => {
  try {
    const { data } = await axios.post<PublishedReelResponse>(
      META_API_URLS.INSTAGRAM_GRAPH.MEDIA_PUBLISH(instagram_id),
      {
        creation_id: container_media_id,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const ig_media_id = data.id;

    await saveVideoUrlAndStatusService(ig_media_id, access_token, publication_id);
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
