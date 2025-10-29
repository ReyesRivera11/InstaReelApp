import { Prisma } from "@prisma/client";
import prisma from "../../../shared/lib/prisma";

import { AppError } from "../../../core/errors/AppError";
import { HttpCode } from "../../../shared/enums/HttpCode";
import { ClientData } from "../interfaces/clientData.interface";
import { IUpdateClient } from "../interfaces/UpdateClient.interface";
import {
  ClientFilters,
  PaginatedClients,
} from "../interfaces/ClientFilters.interface";

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

  static async getPaginatedClients(
    filters: ClientFilters
  ): Promise<PaginatedClients> {
    const { search = "", social_identity, page = 1, limit = 10 } = filters;

    const skip = (page - 1) * limit;

    // Build where
    const where: any = {};

    // Filter by search
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { username: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Filter by social identity
    if (social_identity) {
      where.social_identity = social_identity;
    }

    // Get clients
    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          username: true,
          description: true,
          social_identity: true,
          insta_id: true,
        },
      }),
      prisma.client.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      clients,
      total,
      page,
      totalPages,
      hasNext,
      hasPrev,
    };
  }

  static async createAccount(accountData: ClientData) {
    try {
      const {
        name,
        username,
        description,
        long_lived_token,
        insta_id,
        social_identity,
      } = accountData;

      await prisma.client.create({
        data: {
          name,
          username,
          description,
          long_lived_token,
          insta_id,
          social_identity,
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
