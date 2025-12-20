import axios from "axios";
import prisma from "../../../shared/lib/prisma";
import { TikTokRefreshService } from "../services/tiktok-refresh.service";

const TIKTOK_BASE_URL = "https://open.tiktokapis.com/v2";

export interface TikTokCreatorInfo {
  creator_avatar_url: string;
  creator_username: string;
  creator_nickname: string;
  privacy_level_options: string[];
  comment_disabled: boolean;
  duet_disabled: boolean;
  stitch_disabled: boolean;
  max_video_post_duration_sec: number;
}

export class TikTokCreatorInfoService {
  static async getCreatorInfo(
    clientId: number
  ): Promise<TikTokCreatorInfo> {
    // 1️⃣ Buscar cliente + cuenta TikTok
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: { tiktok_account: true },
    });

    if (!client?.tiktok_account) {
      throw new Error("El cliente no tiene cuenta TikTok vinculada");
    }

    const account = client.tiktok_account;

    // 2️⃣ Refresh token si expiró
    if (account.expires_at && account.expires_at <= new Date()) {
      const refreshed = await TikTokRefreshService.refreshToken(
        account.refresh_token
      );

      await prisma.tiktok_account.update({
        where: { id: account.id },
        data: {
          access_token: refreshed.access_token,
          refresh_token: refreshed.refresh_token,
          expires_at: new Date(
            Date.now() + refreshed.expires_in * 1000
          ),
        },
      });

      account.access_token = refreshed.access_token;
    }

    // 3️⃣ Llamar a TikTok creator_info
    const response = await axios.post(
      `${TIKTOK_BASE_URL}/post/publish/creator_info/query/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${account.access_token}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
      }
    );

    const data = response.data?.data;

    if (!data) {
      throw new Error("TikTok no devolvió información del creador");
    }

    return {
      creator_avatar_url: data.creator_avatar_url,
      creator_username: data.creator_username,
      creator_nickname: data.creator_nickname,
      privacy_level_options: data.privacy_level_options || [],
      comment_disabled: !!data.comment_disabled,
      duet_disabled: !!data.duet_disabled,
      stitch_disabled: !!data.stitch_disabled,
      max_video_post_duration_sec: Number(
        data.max_video_post_duration_sec ?? 0
      ),
    };
  }
}
