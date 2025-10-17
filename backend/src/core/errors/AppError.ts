import { HttpCode } from '../../shared/enums/HttpCode';

interface AppErrorArgs {
  name?: string;
  httpCode: HttpCode;
  description: string;
  details?: Record<string, unknown>;
  isOperational?: boolean;
}

export class AppError extends Error {
  public readonly name: string;
  public readonly httpCode: HttpCode;
  public readonly details?: Record<string, unknown>;
  public readonly isOperational: boolean = true;

  constructor(args: AppErrorArgs) {
    super(args.description);

    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain

    this.name = args.name ?? 'Error';
    this.httpCode = args.httpCode;
    this.details = args.details;

    if (args.isOperational !== undefined) {
      this.isOperational = args.isOperational;
    }

    Error.captureStackTrace(this);
  }
}