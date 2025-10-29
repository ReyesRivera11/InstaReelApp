import { SocialIdentity } from "@prisma/client";

export interface ScheduleReel {
  client_id: number;
  title: string;
  scheduled_date: Date;
  social_identity: SocialIdentity;
  page_access_token?: string;
  target_id?: string;
  description?: string;
}