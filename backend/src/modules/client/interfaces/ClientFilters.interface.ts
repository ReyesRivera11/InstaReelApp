import { SocialIdentity } from "@prisma/client";

export interface ClientFilters {
  search?: string;
  social_identity?: SocialIdentity;
  page?: number;
  limit?: number;
}

export interface PaginatedClients {
  clients: Client[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Client {
  id: number;
  name: string;
  username: string;
  description?: string | null;
  social_identity: SocialIdentity;
  insta_id?: string | null;
}