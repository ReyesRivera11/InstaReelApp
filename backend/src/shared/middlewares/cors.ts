import cors from "cors";

const ACCPETED_ORIGINS = ["http://localhost:5173", 'https://73dc18552c43.ngrok-free.app'];

export const corsMiddleware = ({ acceptedOrigins = ACCPETED_ORIGINS } = {}) =>
  cors({
    origin: (origin, cb) => {
      if (acceptedOrigins.includes(origin!)) {
        return cb(null, true);
      }

      if (!origin) {
        return cb(null, true);
      }

      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  });
