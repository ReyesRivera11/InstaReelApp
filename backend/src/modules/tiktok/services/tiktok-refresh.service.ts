import axios from "axios";

const TIKTOK_BASE_URL = "https://open.tiktokapis.com/v2";

const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY!;
const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET!;

export interface TikTokRefreshResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export class TikTokRefreshService {
  static async refreshToken(
    refresh_token: string
  ): Promise<TikTokRefreshResponse> {
    try {
      const response = await axios.post(
        `${TIKTOK_BASE_URL}/oauth/token/`,
        new URLSearchParams({
          client_key: CLIENT_KEY,
          client_secret: CLIENT_SECRET,
          grant_type: "refresh_token",
          refresh_token,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.error_description ||
          "Failed to refresh TikTok token"
      );
    }
  }
}
