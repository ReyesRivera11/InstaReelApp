import { AppError } from "../../../core/errors/AppError";
import { HttpCode } from "../../../shared/enums/HttpCode";
import { ClientModel } from "../models/client.model";

export const getClientByIdService = async (id: number) => {
  const client = await ClientModel.getClientById(id);

  if(!client) {
    throw new AppError({
      httpCode: HttpCode.NOT_FOUND,
      description: "Cliente no encontrado",
    });
  }

  return client;
};