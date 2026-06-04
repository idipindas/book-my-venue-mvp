import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { AppDataSource } from './config/database';
import { redis } from './config/redis';
import { startBookingWorker } from './config/queue';
import { config } from './config/env';
import { logger } from './lib/logger';
import { errorHandler } from './middleware/error.middleware';
import apiRouter from './routes/index';

const app = express();

app.use(
  pinoHttp({
    level: config.NODE_ENV === 'production' ? 'info' : 'debug',
    transport:
      config.NODE_ENV !== 'production'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
    customLogLevel: (_req, res) => {
      if (res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
    customSuccessMessage: (req, res) =>
      `${req.method} ${req.url} ${res.statusCode}`,
    customErrorMessage: (req, res) =>
      `${req.method} ${req.url} ${res.statusCode}`,
  })
);

app.use(helmet());
app.use(cors({ origin: config.CLIENT_URL, credentials: true }));
app.use(
  rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false })
);

// Capture raw body for Razorpay webhook signature verification before JSON parsing
app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as Express.Request).rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true }));
app.get('/', (_req, res) => res.json({ status: 'test' }));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api', apiRouter);

app.use(errorHandler);

async function bootstrap(): Promise<void> {
  await AppDataSource.initialize();
  logger.info('Database connected');

  startBookingWorker();
  logger.info('BullMQ worker started');

  app.listen(config.PORT, () => {
    logger.info(`API running on http://localhost:${config.PORT}`);
  });
}

bootstrap().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});

export default app;
