import prisma from "../../../shared/lib/prisma";
import { AppError } from "../../../core/errors/AppError";
import { HttpCode } from "../../../shared/enums/HttpCode";

export const getXAccessTokenByClient = async (client_id: number) => {
  console.log("[X TOKEN] Buscando token para client_id:", client_id)

  const token = await prisma.x_account.findFirst({
    where: { client_id },
  })

  console.log("[X TOKEN] Resultado:", token)

  if (!token) {
    throw new AppError({
      name: "XTokenNotFound",
      httpCode: HttpCode.UNAUTHORIZED,
      description: "No existe token de X para este cliente",
    })
  }

  return token.access_token
}
