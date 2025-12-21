import axios from "axios";

const TIKTOK_API_BASE = "https://open.tiktokapis.com";

interface InitUploadArgs {
  access_token: string;

  /** Caption del video (incluye hashtags) */
  title: string;

  /** URL pública verificada */
  video_url: string;

  /** SELF_ONLY | PUBLIC_TO_EVERYONE | MUTUAL_FOLLOW_FRIENDS */
  privacy_level: string;

  /** Interacciones */
  allow_comment: boolean;
  allow_duet: boolean;
  allow_stitch: boolean;
}

export class TikTokUploadService {
  static async initUpload(args: InitUploadArgs) {
    const {
      access_token,
      title,
      video_url,
      privacy_level,
      allow_comment,
      allow_duet,
      allow_stitch,
    } = args;

    const response = await axios.post(
      `${TIKTOK_API_BASE}/v2/post/publish/video/init/`,
      {
        post_info: {
          title, 
          privacy_level,

          disable_comment: !allow_comment,
          disable_duet: !allow_duet,
          disable_stitch: !allow_stitch,
        },

        source_info: {
          source: "PULL_FROM_URL",
          video_url,
        },
      },
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
