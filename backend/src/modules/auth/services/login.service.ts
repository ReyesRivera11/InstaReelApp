import { Request } from "express";
import { LoginData } from '../interfaces/login.interface';
import { AuthModel } from "../models/auth.model";
import { tokenService } from "../../../shared/services/tokens.service";

export const loginService = async (
  { email, password }: LoginData,
  cookies: Request["cookies"]
) => {
  const user = await AuthModel.login({ email, password });

  const accessToken = tokenService.generateAccessToken({
    id: user.id,
    email: user.email,
  });

  const refreshToken = tokenService.generateRefreshToken({
    id: user.id,
    email: user.email,
  });

  const existingTokens = user.refresh_tokens.map((rt) => rt.token);

  let newRefreshTokenArray = !cookies.jwt
    ? existingTokens
    : existingTokens.filter((rt) => rt !== cookies.jwt);

  if (cookies?.jwt) {
    const refreshToken = cookies.jwt;
    const foundToken = await tokenService.findRefreshToken(refreshToken);

    // Detected refresh token reuse!
    if (!foundToken || foundToken.id !== user.id) {
      console.log("attempted refresh token reuse at login!");
      // clear out ALL previous refresh tokens
      newRefreshTokenArray = [];
    }
  }

  await tokenService.replaceAllUserTokens(user.id, [
    ...newRefreshTokenArray,
    refreshToken,
  ]);


  return {
    accessToken,
    refreshToken,
    user: { ...user, refresh_tokens: undefined },
  };
};
