import Redis from "ioredis";
import { Redis as UpstashRedis } from "@upstash/redis";
import { config } from "./env";
import { logger } from "../lib/logger";

let redis: Redis | UpstashRedis;

if (config.NODE_ENV === "production") {
  redis = new UpstashRedis({
    url: config.UPSTASH_REDIS_REST_URL,
    token: config.UPSTASH_REDIS_REST_TOKEN,
  });
  console.warn("Using Upstash Redis=============================");
  logger.info("Using Upstash Redis");
} else {
  const localRedis = new Redis(config.REDIS_URL, {
    maxRetriesPerRequest: null,
    lazyConnect: true,
  });

  localRedis.on("error", (err) =>
    logger.error({ err }, "Redis error")
  );
  console.warn("Using local Redis=============================");

  localRedis.on("connect", () =>
    logger.info("Redis connected")
  );

  redis = localRedis;
}

export { redis };