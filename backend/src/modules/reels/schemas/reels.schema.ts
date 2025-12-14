import { ReelStatus, SocialIdentity } from "@prisma/client";
import z from "zod";

export const reelsIdSchema = z.object({ id: z.coerce.number().positive() });

export const scheduleReelSchema = z
  .object({
    client_id: z.coerce.number().positive(),
    scheduled_date: z.coerce.date(),
    social_identity: z.enum(SocialIdentity),
    title: z.string(),
    description: z.string().optional(),
    page_access_token: z.string().optional(),
    page_id: z.string().optional(),
  })
  .refine(
    (data) => {
      const now = new Date();
      const scheduledDate = new Date(data.scheduled_date);
      const tenMinutesLater = new Date(now.getTime() + 10 * 60000);
      const twentyNineDaysLater = new Date(
        now.getTime() + 29 * 24 * 60 * 60000
      );

      return (
        scheduledDate >= tenMinutesLater && scheduledDate <= twentyNineDaysLater
      );
    },
    {
      message:
        "La fecha programada debe ser al menos 10 minutos en el futuro y no mayor a 29 días",
      path: ["scheduled_date"], // Esto asocia el error al campo scheduled_date
    }
  );

export const getFiltersSchema = z.object({
  search: z.string().optional(),
  social_identity: z.enum(SocialIdentity).optional(),
  status: z.enum(ReelStatus).optional(),
  page: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive())
    .optional()
    .default(1),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive().max(50))
    .optional()
    .default(10),
});
