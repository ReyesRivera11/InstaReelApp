import { SocialIdentity } from "@prisma/client";
import z from "zod";

export const clientIdSchema = z.object({ id: z.coerce.number().positive() });

export const createClientSchema = z.object({
  long_lived_token: z.string(),
  name: z.string().min(3),
  username: z.string().min(3),
  social_identity: z.enum(SocialIdentity),
  access_token: z.string().optional(),
  data_access_expiration_time: z.string().optional(),
  expires_in: z.string().optional(),
  description: z.string().optional(),
});

export const updateClientSchema = createClientSchema
  .pick({
    description: true,
  })
  .extend({
    name: z.string().min(3).optional(),
    username: z.string().min(3).optional(),
  });

export const ClientFiltersSchema = z.object({
  search: z.string().optional(),
  social_identity: z.enum(['INSTAGRAM', 'FACEBOOK']).optional(),
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional().default(1),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(50)).optional().default(10)
});