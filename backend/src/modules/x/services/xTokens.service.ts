import prisma from "../../../shared/lib/prisma";
import { AppError } from "../../../core/errors/AppError";
import { HttpCode } from "../../../shared/enums/HttpCode";

export class XTokensService {

  // EXISTENTE (no lo tocamos)
  static async getOAuth2ByClient(clientId: number) {
    const account = await prisma.x_account.findFirst({
      where: { client_id: clientId },
    });

    if (!account?.access_token) {
      throw new AppError({
        httpCode: HttpCode.NOT_FOUND,
        description: "OAuth 2.0 token not found for this client",
      });
    }

    return {
      access_token: account.access_token,
      refresh_token: account.refresh_token,
      expires_at: account.expires_at,
    };
  }

  // ============================
  // 🆕 NUEVO: OAuth 1.0a
  // ============================
  static async getOAuth1ByClient(clientId: number) {
    const account = await prisma.x_account.findFirst({
      where: { client_id: clientId },
    });

    if (!account?.oauth1_token || !account?.oauth1_token_secret) {
      throw new AppError({
        httpCode: HttpCode.BAD_REQUEST,
        description:
          "OAuth 1.0a not connected. User must authorize media permissions.",
      });
    }

    return {
      oauth1_token: account.oauth1_token,
      oauth1_token_secret: account.oauth1_token_secret,
      x_user_id: account.x_user_id,
      username: account.username,
    };
  }
}
