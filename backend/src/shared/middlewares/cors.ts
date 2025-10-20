import cors from "cors";
import { AppError } from "../../core/errors/AppError";
import { HttpCode } from "../enums/HttpCode";

const ACCPETED_ORIGINS = [
  "http://localhost:5173",
  "https://instareel-app.netlify.app",
];

export const corsMiddleware = ({ acceptedOrigins = ACCPETED_ORIGINS } = {}) =>
  cors({
    origin: (origin, cb) => {
      if (acceptedOrigins.includes(origin!)) {
        return cb(null, true);
      }

      if (!origin) {
        return cb(null, true);
      }

      return cb(new AppError({
        httpCode: HttpCode.FORBIDDEN,
        description: "Origin not allowed",
      }));
    },
    credentials: true
  });
