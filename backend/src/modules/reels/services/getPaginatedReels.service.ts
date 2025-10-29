import { GetReelsFilters } from "../interfaces/GetReelsFilters.interface";
import { ReelsModel } from "../models/reels.model";

export const getPaginatedReelsService = async (filters: GetReelsFilters) => {
  const reels = await ReelsModel.getPaginatedReels(filters);

  return reels;
};