import { Request, Response, NextFunction } from "express";

import { errorHandler } from '../../core/errors/ErrorHandler';
import { AppError } from "../../core/errors/AppError";

export const errorHandlerMiddleware = (
  err: Error | AppError,
  _req: Request,
  response: Response,
  next: NextFunction
): void => {
  errorHandler.handleError(err, response);
  next();
};