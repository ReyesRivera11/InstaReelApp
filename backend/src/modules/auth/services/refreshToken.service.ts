import { Response, Request } from "express";
import { HttpCode } from "../../../shared/enums/HttpCode";
import { tokenService } from "../../../shared/services/tokens.service";
import jwt from "jsonwebtoken";
import { JWT_REFRESH_TOKEN } from "../../../shared/config/env";
import { JwtPayload } from "../../../shared/interfaces/JwtPayload";
import { AppError } from "../../../core/errors/AppError";

export const refreshTokenService = async (
  cookies: Request["cookies"],
  res: Response
): Promise<{ accessToken: string; newRefreshToken: string }> => {
  if (!cookies?.jwt) {
    throw new AppError({
      httpCode: HttpCode.UNAUTHORIZED,
      description: "Refresh token required",
    });
  }

  const refreshToken = cookies.jwt;

  res.clearCookie("jwt", { httpOnly: true, sameSite: "strict", secure: true });

  const foundToken = await tokenService.findRefreshToken(refreshToken);

  if (!foundToken) {
    const decoded = jwt.verify(refreshToken, String(JWT_REFRESH_TOKEN));

    await tokenService.replaceAllUserTokens((decoded as JwtPayload).id, []);

    throw new AppError({
      httpCode: HttpCode.FORBIDDEN,
      description: "Refresh token not found",
    });
  }

  const decoded = jwt.verify(
    refreshToken,
    String(JWT_REFRESH_TOKEN)
  ) as JwtPayload;

  if (foundToken.user_id !== decoded.id) {
    throw new AppError({
      httpCode: HttpCode.FORBIDDEN,
      description: "Invalid refresh token",
    });
  }

  const jwtPayloadData = {
    id: decoded.id,
    email: decoded.email,
  };

  const accessToken = tokenService.generateAccessToken(jwtPayloadData);
  const newRefreshToken = tokenService.generateRefreshToken(jwtPayloadData);

  await tokenService.deleteSpecificRefreshToken(refreshToken);
  await tokenService.storeRefreshToken(foundToken.user_id, newRefreshToken);

  return { accessToken, newRefreshToken };
};
