import { ClientModel } from "../models/client.model"

export const getAllClientsService = async() => {
  const clients = await ClientModel.getAllClients();

  return clients;
}