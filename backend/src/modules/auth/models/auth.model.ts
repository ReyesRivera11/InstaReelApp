import prisma from "../../../shared/lib/prisma";

import { comparePassword } from "../../../shared/utils/comparePassword";

import { AppError } from "../../../core/errors/AppError";
import { HttpCode } from "../../../shared/enums/HttpCode";
import { LoginData } from "../interfaces/login.interface";

export class AuthModel {
  static async login({ email, password }: LoginData) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        refresh_tokens: {
          include: {
            user: false,
          },
        },
      },
    });

    if (!user) {
      throw new AppError({
        httpCode: HttpCode.NOT_FOUND,
        description: "Correo electrónico no registrado",
      });
    }

    const isPasswordCorrect = await comparePassword(password, user.password);

    if (!isPasswordCorrect) {
      throw new AppError({
        httpCode: HttpCode.UNAUTHORIZED,
        description: "Credenciales incorrectas",
      });
    }

    const { password: _, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }
}
