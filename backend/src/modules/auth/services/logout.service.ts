import { Response, Request } from "express";
import { tokenService } from "../../../shared/services/tokens.service";
import { HttpCode } from "../../../shared/enums/HttpCode";

export const logoutService = async (cookies: Request["cookies"], res: Response) => {
  const refreshToken = cookies.jwt;
  
  const foundToken = await tokenService.findRefreshToken(refreshToken);

  if (!foundToken) {
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    res.sendStatus(204);
    return;
  }

  await tokenService.deleteSpecificRefreshToken(refreshToken);

  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "strict",
    secure: true,
  });
  
  res.sendStatus(HttpCode.NO_CONTENT);
};
