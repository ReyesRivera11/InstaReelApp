import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";

import {
  JWT_ACCESS_TOKEN,
  JWT_REFRESH_TOKEN,
  JWT_ACCESS_TOKEN_EXPIRES_IN,
  JWT_REFRESH_TOKEN_EXPIRES_IN,
} from "../config/env";

import { JwtPayload } from "../interfaces/JwtPayload";

class TokenService {
  private accessSecret: string;
  private refreshSecret: string;

  constructor() {
    this.accessSecret = String(JWT_ACCESS_TOKEN);
    this.refreshSecret = String(JWT_REFRESH_TOKEN);
  }

  public generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.accessSecret, {
      expiresIn: `${Number(JWT_ACCESS_TOKEN_EXPIRES_IN)}min`,
    });
  }

  public generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.refreshSecret, {
      expiresIn: `${Number(JWT_REFRESH_TOKEN_EXPIRES_IN)}d`,
    });
  }

  public verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, this.accessSecret) as JwtPayload;
  }

  public verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, this.refreshSecret) as JwtPayload;
  }

  public async replaceAllUserTokens(
    userId: number,
    tokens: string[]
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.refresh_tokens.deleteMany({
        where: { user_id: userId },
      });

      if (tokens.length > 0) {
        const tokensData = tokens.map((token) => ({
          user_id: userId,
          token: token,
        }));

        await tx.refresh_tokens.createMany({
          data: tokensData,
        });
      }
    });
  }

  public async deleteSpecificRefreshToken(token: string): Promise<void> {
    await prisma.refresh_tokens.deleteMany({
      where: { token },
    });
  }

  public async storeRefreshToken(userId: number, token: string): Promise<void> {
    console.log({ userId });
    
    await prisma.refresh_tokens.create({
      data: {
        user_id: userId,
        token: token,
      },
    });
  }

  public async findRefreshToken(token: string) {
    return await prisma.refresh_tokens.findFirst({
      where: { token },
      include: {
        user: {
          select: { id: true, email: true },
        },
      },
    });
  }
}

export const tokenService = new TokenService();
