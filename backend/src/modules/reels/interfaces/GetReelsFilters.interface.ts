import { ReelStatus, SocialIdentity } from "@prisma/client";

export interface GetReelsFilters {
  search?: string;
  status?: ReelStatus;
  social_identity?: SocialIdentity;
  page?: number;
  limit?: number;
}
