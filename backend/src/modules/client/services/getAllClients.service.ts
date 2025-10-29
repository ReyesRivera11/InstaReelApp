import { ClientModel } from "../models/client.model";
import { ClientFilters, PaginatedClients } from "../interfaces/ClientFilters.interface";

export const getAllClientsService = async (filters: ClientFilters): Promise<PaginatedClients> => {
  const result = await ClientModel.getPaginatedClients(filters);
  return result;
};