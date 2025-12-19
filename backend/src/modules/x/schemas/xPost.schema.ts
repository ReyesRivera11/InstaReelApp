import { z } from "zod";

export const xPostSchema = z.object({
    text: z.string().min(1).max(280),
    scheduled_at: z.string().datetime().optional(),
});
