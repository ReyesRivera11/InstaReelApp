import { IUpdateClient } from "../interfaces/UpdateClient.interface";
import { ClientModel } from "../models/client.model";

export const updateClientService = async (updateClientData: IUpdateClient) => {
  await ClientModel.updateClient(updateClientData);
};