import { z } from "zod"

export const xPostSchema = z.object({
    client_id: z.coerce.number(),
    text: z.string().min(1).max(280),

    // programado (opcional si publish_now=true)
    scheduled_at: z.coerce.date().optional(),

    // inmediato (opcional)
    publish_now: z
        .union([z.literal(true), z.literal("true")])
        .optional(),
})
