import { SocialIdentity } from "@prisma/client";

export interface ScheduleReel {
  client_id: number;
  title: string;
  scheduled_date: Date;
  social_identity: SocialIdentity;
  description?: string;
}