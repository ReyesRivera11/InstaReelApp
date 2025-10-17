import { Request, Response } from "express";
import { loginSchema } from "../schemas/auth.schema";
import { validateSchema } from "../../../shared/utils/zodValidation";
import { loginService } from "../services/login.service";
import { JWT_REFRESH_TOKEN_EXPIRES_IN } from "../../../shared/config/env";

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
       maxAge: Number(JWT_REFRESH_TOKEN_EXPIRES_IN) * 24 * 60 * 60 * 1000
    });

    res.json({
      accessToken,
      user,
    });
  }
}
