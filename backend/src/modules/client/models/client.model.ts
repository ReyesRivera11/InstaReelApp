import { Prisma } from "@prisma/client";
import prisma from "../../../shared/lib/prisma";

import { AppError } from "../../../core/errors/AppError";
import { HttpCode } from "../../../shared/enums/HttpCode";
import { ClientData } from "../interfaces/clientData.interface";

export class ClientModel {
  static async getClientById(id: number) {
    const client = await prisma.client.findUnique({
      where: { id },
    });

    return client;
  }

  static async getAllClients() {
    const clients = await prisma.client.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        description: true,
        id_insta: true,
      },
    });

    return clients;
  }

  static async createAccount(accountData: ClientData) {
    try {
      const { name, username, description, long_lived_token, insta_id } =
        accountData;

      await prisma.client.create({
        data: {
          name,
          username,
          description,
          long_lived_token,
          id_insta: insta_id,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new AppError({
            httpCode: HttpCode.CONFLICT,
            description: `El usuario ${accountData.username} ya existe`,
          });
        }

        throw new AppError({
          httpCode: HttpCode.CONFLICT,
          description: "Error al guardar el token de acceso del cliente",
        });
      }

      throw error;
    }
  }
}
