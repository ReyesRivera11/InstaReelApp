import { Request, Response, NextFunction } from "express";
import { XOAuthService } from "../services/xOAuth.service";
import { AppError } from "../../../core/errors/AppError";
import { HttpCode } from "../../../shared/enums/HttpCode";

/**
 * PKCE store temporal (DEV)
 * En prod: Redis / DB / cache distribuido
 */
const pkceStore = new Map<number, string>();

export class XAuthController {
  static async auth(req: Request, res: Response, next: NextFunction) {
    try {
      const clientId = Number(req.params.clientId);

      if (isNaN(clientId)) {
        throw new AppError({
          httpCode: HttpCode.BAD_REQUEST,
          description: "Invalid clientId",
        });
      }

      const { url, codeVerifier } =
        XOAuthService.generateAuthUrl(clientId);

      pkceStore.set(clientId, codeVerifier);

      return res.redirect(url);
    } catch (error) {
      next(error);
    }
  }

  static async callback(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, state } = req.query;

      if (!code || !state) {
        throw new AppError({
          httpCode: HttpCode.BAD_REQUEST,
          description: "Missing code or state",
        });
      }

      const clientId = Number(state);
      const codeVerifier = pkceStore.get(clientId);

      if (!codeVerifier) {
        throw new AppError({
          httpCode: HttpCode.BAD_REQUEST,
          description: "PKCE verifier not found or expired",
        });
      }

      await XOAuthService.exchangeCode(
        clientId,
        code as string,
        codeVerifier
      );

      pkceStore.delete(clientId);

      return res.redirect(
        `${process.env.FRONTEND_URL}/clients/${clientId}?x=connected`
      );
    } catch (error) {
      next(error);
    }
  }
}
