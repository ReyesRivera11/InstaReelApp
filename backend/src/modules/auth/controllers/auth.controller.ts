import { Request, Response } from "express";
import { JWT_REFRESH_TOKEN_EXPIRES_IN } from "../../../shared/config/env";

import { validateSchema } from "../../../shared/utils/zodValidation";
import { HttpCode } from "../../../shared/enums/HttpCode";

import { loginSchema } from "../schemas/auth.schema";
import { loginService, logoutService} from '../services/index'

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
}
