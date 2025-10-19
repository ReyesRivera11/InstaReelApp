import { z, ZodObject } from "zod";
import { AppError } from "../../core/errors/AppError";
import { HttpCode } from "../enums/HttpCode";

export const validateSchema = async <T extends ZodObject<any, any>>(
  schema: T, 
  data: unknown
): Promise<z.infer<T>> => {
  const result = await schema.safeParseAsync(data);

  if (!result.success) {
    const errors = result.error.issues.map((err) => ({
      path: err.path.join(': '),
      message: err.message,
    }));

    throw new AppError({
      httpCode: HttpCode.BAD_REQUEST,
      description: 'Validation error',
      details: {
        errors,
      },
    });
  }

  return result.data;
};

