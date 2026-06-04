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

const isUpstash = config.NODE_ENV === 'production' && !!config.UPSTASH_REDIS_REST_URL;

if (isUpstash) {
  logger.info('Using Upstash Redis REST for cache');
} else {
  logger.info('Using local Redis');
}

export async function redisSet(key: string, value: string, ttlSeconds: number): Promise<void> {
  if (isUpstash) {
    await (redis as UpstashRedis).set(key, value, { ex: ttlSeconds });
  } else {
    await (redis as Redis).set(key, value, 'EX', ttlSeconds);
  }
}

export async function redisGet(key: string): Promise<string | null> {
  return (await redis.get(key)) as string | null;
}

export async function redisDel(...keys: string[]): Promise<void> {
  await redis.del(...keys as [string]);
}

export { redis, ioredisClient };
