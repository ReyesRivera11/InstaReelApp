import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from "path";

import { PORT } from './shared/config/env';
import router from './shared/routes/index';
import { errorHandlerMiddleware } from './shared/middlewares/errorHandler';
import { corsMiddleware } from './shared/middlewares/cors';
import { HttpCode } from './shared/enums/HttpCode';

import cron from "node-cron";
import { processTikTokReels } from "./shared/jobs/tiktok-publisher.job";

const app = express();

app.disable('x-powered-by');
app.set("trust proxy", 1);

app.use(corsMiddleware());
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

app.get('/healthcheck', (_req: Request, res: Response) => {
  res.sendStatus(HttpCode.OK);
});

app.use(
   "/uploads",
   express.static(path.join(process.cwd(), "uploads"))
);

cron.schedule("* * * * *", async () => {
   try {
      await processTikTokReels();
   } catch (error) {
      console.error("❌ Error running TikTok cron:", error);
   }
});

// Routes
app.use('/api', router);

app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;