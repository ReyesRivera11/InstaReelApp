import z from "zod";

export const scheduleReelSchema = z.object({
  client_id: z.coerce.number().positive(),
  container_media_id: z.string(),
  scheduled_date: z.coerce.date(),
  title: z.string(),
  description: z.string().optional(),
});
