import { ZodError, type ZodType, z } from 'zod';

export type ValidationSchemaResult<T extends ZodType> =
  | { success: true; data: z.infer<T> }
  | { success: false; error: ZodError };