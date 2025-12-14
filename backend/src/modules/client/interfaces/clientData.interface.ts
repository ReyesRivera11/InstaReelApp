import { SocialIdentity } from "@prisma/client";

export interface ClientData {
  long_lived_token: string;
  name: string;
  username: string;
  social_identity: SocialIdentity;
  access_token?: string;
  data_access_expiration_time?: string;
  expires_in?: string;
  description?: string;
  insta_id?: string;
}