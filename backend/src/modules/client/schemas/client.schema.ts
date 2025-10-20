import z from "zod";

export const createClientSchema = z.object({
  long_lived_token: z.string(),
  name: z.string(),
  username: z.string(),
  access_token: z.string().optional(),
  data_access_expiration_time: z.string().optional(),
  expires_in: z.string().optional(),
  description: z.string().optional(),
});
