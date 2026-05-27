import Redis from 'ioredis';
import { config } from './env';
import { logger } from '../lib/logger';

export const redis = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: null,
  lazyConnect: true,
});

redis.on('error', (err) => logger.error({ err }, 'Redis error'));
redis.on('connect', () => logger.info('Redis connected'));
