import z from "zod";

export const publicationIdSchema = z.object({ id: z.coerce.number().positive() });

export const scheduleReelSchema = z.object({
  client_id: z.coerce.number().positive(),
  container_media_id: z.string(),
  scheduled_date: z.coerce.date(),
  title: z.string(),
  description: z.string().optional(),
});


export const publicationFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['scheduled', 'published']).optional(),
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional().default(1),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(50)).optional().default(10)
});