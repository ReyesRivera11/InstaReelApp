import { PublicationFilters } from "../interfaces/PublicationFilters.interface";
import { PublicationModel } from "../models/publication.model";

export const getPublicationsService = async (filters: PublicationFilters) => {
  const result = await PublicationModel.getPaginatedPublications(filters);

  return result;
};