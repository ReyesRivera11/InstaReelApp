import { PublicationModel } from "../models/publication.model";

export const getPublicationsService = async () => {
  const publications = await PublicationModel.getAllPublications();

  return publications;
};