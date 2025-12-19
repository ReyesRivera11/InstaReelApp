import z from "zod";

export const clientIdSchema = z.object({ id: z.coerce.number().positive() });
import { SocialIdentity } from "@prisma/client";

export const createClientSchema = z.object({
  name: z.string(),
  username: z.string(),
  social_identity: z.nativeEnum(SocialIdentity),
  description: z.string().optional(),
  insta_id: z.string().optional(),
  long_lived_token: z.string().optional(),
});


export const updateClientSchema = createClientSchema
  .pick({
    description: true,
  })
  .extend({
    name: z.string().min(3).optional(),
    username: z.string().min(3).optional(),
  });
