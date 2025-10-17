import { HttpCode } from '../enums/HttpCode';

export interface AppErrorArgs {
  name?: string;
  httpCode: HttpCode;
  description: string;
  isOperational?: boolean;
}