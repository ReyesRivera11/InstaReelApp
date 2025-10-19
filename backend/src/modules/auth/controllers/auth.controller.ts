import { Request, Response } from "express";
import { JWT_REFRESH_TOKEN_EXPIRES_IN } from "../../../shared/config/env";

import { validateSchema } from "../../../shared/utils/zodValidation";
import { AppError } from "../../../core/errors/AppError";
import { HttpCode } from "../../../shared/enums/HttpCode";

import { loginSchema } from "../schemas/auth.schema";
import {
  loginService,
  logoutService,
  refreshTokenService,
  getMeService,
} from "../services/index";

export class AuthController {
  static async login(req: Request, res: Response) {
    const cookies = req.cookies;
    const { email, password } = await validateSchema(loginSchema, req.body);

    const { accessToken, refreshToken, user } = await loginService(
      { email, password },
      cookies
    );

    if (cookies?.jwt) {
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "strict",
        secure: true,
      });
    }

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: Number(JWT_REFRESH_TOKEN_EXPIRES_IN) * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken,
      user,
    });
  }

  static async logout(req: Request, res: Response) {
    const cookies = req.cookies;

    if (!cookies?.jwt) {
      res.sendStatus(HttpCode.NO_CONTENT);
      return;
    }

    await logoutService(cookies, res);
  }

  static async refreshToken(req: Request, res: Response) {
    const cookies = req.cookies;

    const { accessToken, newRefreshToken } = await refreshTokenService(
      cookies,
      res
    );

    res.cookie("jwt", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: Number(JWT_REFRESH_TOKEN_EXPIRES_IN) * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  }

  static async getMe(req: Request, res: Response) {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError({
        httpCode: HttpCode.UNAUTHORIZED,
        description: "No authorization token provided",
      });
    }

    const accessToken = authHeader.split(" ")[1];

    const user = await getMeService(accessToken);

    res.json({ user });
  }
}
