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
  /**
   * 🔐 Inicia OAuth de X
   * - Crea un CLIENT nuevo
   * - social_identity = X
   * - Genera URL OAuth
   */
  static async auth(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, username, description } = req.body;

      if (!name || !username) {
        throw new AppError({
          httpCode: HttpCode.BAD_REQUEST,
          description: "name and username are required",
        });
      }

      // 1️⃣ Crear client + generar OAuth URL
      const { clientId, url, codeVerifier } =
        await XOAuthService.generateAuthUrl({
          name,
          username,
          description,
        });

      // 2️⃣ Guardar PKCE verifier
      pkceStore.set(clientId, codeVerifier);

      // 3️⃣ Redirigir a X
      return res.status(200).json({
        success: true,
        url,
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🔁 Callback OAuth de X
   */
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

      if (isNaN(clientId)) {
        throw new AppError({
          httpCode: HttpCode.BAD_REQUEST,
          description: "Invalid state (clientId)",
        });
      }

      const codeVerifier = pkceStore.get(clientId);

      if (!codeVerifier) {
        throw new AppError({
          httpCode: HttpCode.BAD_REQUEST,
          description: "PKCE verifier not found or expired",
        });
      }

      // 3️⃣ Intercambiar code por tokens y guardar cuenta X
      await XOAuthService.exchangeCode(
        clientId,
        code as string,
        codeVerifier
      );

      pkceStore.delete(clientId);

      // 4️⃣ Redirección al frontend
      return res.redirect(
        `${process.env.FRONTEND_URL}/clients/${clientId}?x=connected`
      );
    } catch (error) {
      next(error);
    }
  }
}
