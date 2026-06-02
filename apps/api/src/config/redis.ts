import Redis from 'ioredis';
import { Redis as UpstashRedis } from '@upstash/redis';
import { config } from './env';
import { logger } from '../lib/logger';

// ioredis instance — required by BullMQ and Redis lock operations (SET NX).
// Always uses a real TCP Redis connection regardless of environment.
const ioredisClient = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: null,
  lazyConnect: true,
});

ioredisClient.on('error', (err) => logger.error({ err }, 'Redis error'));
ioredisClient.on('connect', () => logger.info('Redis connected'));

// Application-level cache client.
// In production uses Upstash REST (no persistent connection needed).
// In development falls back to the same ioredis instance.
const redis: Redis | UpstashRedis =
  config.NODE_ENV === 'production' && config.UPSTASH_REDIS_REST_URL
    ? new UpstashRedis({
        url: config.UPSTASH_REDIS_REST_URL,
        token: config.UPSTASH_REDIS_REST_TOKEN,
      })
    : ioredisClient;

if (config.NODE_ENV === 'production' && config.UPSTASH_REDIS_REST_URL) {
  logger.info('Using Upstash Redis REST for cache');
} else {
  logger.info('Using local Redis');
}

export { redis, ioredisClient };
