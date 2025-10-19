import { Response } from 'express';
import { AppError } from './AppError';
import { HttpCode } from '../../shared/enums/HttpCode';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

class ErrorHandler {
  private isTrustedError(error: Error): boolean {
    if (error instanceof AppError) return error.isOperational;
    if (error instanceof JsonWebTokenError) return true;
    if (error.message.includes('token')) return true;

    return false;
  }

  public handleError(error: Error | AppError, response?: Response): void {
    if (this.isTrustedError(error) && response) {
      this.handleTrustedError(error as AppError, response);
    } else {
      this.handleCriticalError(error, response);
    }
  }

  private handleTrustedError(error: AppError, response: Response): void {
    if (error instanceof JsonWebTokenError || error instanceof TokenExpiredError) {
      response.status(HttpCode.UNAUTHORIZED).json({ message: 'El token proporcionado ha expirado o es inválido.' });
      return;
    }

    response.status(error.httpCode).json({
      message: error.message,
      errors: error.details?.errors,
    });
  }

  private handleCriticalError(error: Error | AppError, response?: Response): void {
    console.log(error);

    if (response) {
      response.status(HttpCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }

    console.log('Application encountered a critical error. Exiting');
    process.exit(1);
  }
}

export const errorHandler = new ErrorHandler();