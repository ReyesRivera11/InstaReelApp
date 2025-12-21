import axios from "axios";

const TIKTOK_BASE_URL = "https://open.tiktokapis.com/v2";

export interface TikTokCreatorInfo {
  creator_username: string;
  creator_nickname: string;
  max_video_post_duration_sec: number;
  privacy_level_options: string[];
  comment_disabled: boolean;
  duet_disabled: boolean;
  stitch_disabled: boolean;
}

export class TikTokCreatorService {
  static async queryCreatorInfo(
    access_token: string
  ): Promise<TikTokCreatorInfo> {
    const response = await axios.post(
      `${TIKTOK_BASE_URL}/post/publish/creator_info/query/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
      }
    );

    return response.data?.data;
  }
}
