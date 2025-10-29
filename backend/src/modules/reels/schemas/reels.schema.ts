import { ReelStatus, SocialIdentity } from "@prisma/client";
import z from "zod";

export const reelsIdSchema = z.object({ id: z.coerce.number().positive() });

export const scheduleReelSchema = z.object({
  client_id: z.coerce.number().positive(),
  scheduled_date: z.coerce.date(),
  social_identity: z.enum(SocialIdentity),
  title: z.string(),
  description: z.string().optional(),
});


export const getFiltersSchema = z.object({
  search: z.string().optional(),
  social_identity: z.enum(SocialIdentity).optional(),
  status: z.enum([ReelStatus.PUBLISHED, ReelStatus.SCHEDULED]).optional(),
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional().default(1),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(50)).optional().default(10)
});