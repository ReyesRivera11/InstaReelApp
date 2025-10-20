import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import { PORT } from './shared/config/env';
import router from './shared/routes/index';
import { errorHandlerMiddleware } from './shared/middlewares/errorHandler';
import { corsMiddleware } from './shared/middlewares/cors';

const app = express();

app.disable('x-powered-by');

app.use(corsMiddleware());
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

app.get('/healthcheck', (_req: Request, res: Response) => {
  res.status(200).send('OK');
});

// Routes
app.use('/api', router);

app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;