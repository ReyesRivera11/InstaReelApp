import z from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const jwtPayloadSchema = z.object({
  id: z.coerce.number().positive(),
  email: z.email()
});