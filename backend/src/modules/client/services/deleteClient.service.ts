import { ClientModel } from "../models/client.model";

export const deleteClientService = async (id: number) => {
  await ClientModel.deleteClient(id);
};