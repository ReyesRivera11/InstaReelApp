import { ZodType } from 'zod';
import { ValidationSchemaResult } from '../types/zod';

export const zodValidation = <T extends ZodType>(
  schema: T,
  data: unknown
): ValidationSchemaResult<T> => {
  return schema.safeParse(data);
};