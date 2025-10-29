import { Prisma } from "@prisma/client";
import prisma from "../../../shared/lib/prisma";

import { AppError } from "../../../core/errors/AppError";
import { HttpCode } from "../../../shared/enums/HttpCode";
import { ClientData } from "../interfaces/clientData.interface";
import { IUpdateClient } from "../interfaces/UpdateClient.interface";

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
      },
    });

    return clients;
  }

  static async createAccount(accountData: ClientData) {
    try {
      const { name, username, description, long_lived_token, insta_id, social_identity } =
        accountData;

      await prisma.client.create({
        data: {
          name,
          username,
          description,
          long_lived_token,
          insta_id,
          social_identity
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

  static async updateClient(updateClientData: IUpdateClient) {
    const { id, name, username, description } = updateClientData;

    try {
      await prisma.client.update({
        where: { id },
        data: {
          name,
          username,
          description,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new AppError({
            httpCode: HttpCode.CONFLICT,
            description: `El usuario ${username} ya existe`,
          });
        }

        throw new AppError({
          httpCode: HttpCode.CONFLICT,
          description: "Error al actualizar el cliente",
        });
      }

      throw error;
    }
  }

  static async deleteClient(id: number) {
    try {
      await prisma.client.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new AppError({
            httpCode: HttpCode.CONFLICT,
            description: "El cliente a eliminar no existe",
          });
        }

        throw new AppError({
          httpCode: HttpCode.CONFLICT,
          description: "Error al eliminar el cliente",
        });
      }

      throw error;
    }
  }
}
