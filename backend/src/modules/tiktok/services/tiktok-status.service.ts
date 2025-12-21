import axios from "axios";

const TIKTOK_BASE_URL = "https://open.tiktokapis.com/v2";

export type TikTokPublishStatusValue =
  | "PROCESSING"
  | "PROCESSING_DOWNLOAD"
  | "SUCCESS"
  | "PUBLISH_COMPLETE"
  | "FAILED";

export interface TikTokPublishStatus {
  status: TikTokPublishStatusValue;
  video_id?: string;
  error_message?: string;
}

export class TikTokStatusService {
  static async getStatus(params: {
    access_token: string;
    publish_id: string;
  }): Promise<TikTokPublishStatus> {
    const { access_token, publish_id } = params;

    const response = await axios.post(
      `${TIKTOK_BASE_URL}/post/publish/status/fetch/`,
      { publish_id },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
      }
    );

    const data = response.data?.data;

    return {
      status: data?.status as TikTokPublishStatusValue,
      video_id: data?.video_id,
      error_message: data?.error_message,
    };
  }
}

