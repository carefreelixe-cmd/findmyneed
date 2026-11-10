import Redis from "ioredis";
import "dotenv/config";

const redisUrl = process.env.REDIS_URL;

export const redisEnabled = Boolean(redisUrl);

export const redis = redisEnabled
  ? new Redis(redisUrl, {
      enableReadyCheck: true,
      maxRetriesPerRequest: 2,
      retryStrategy(times) {
        return Math.min(times * 200, 5000);
      },
    })
  : null;

export const bullConnection = redisEnabled
  ? new Redis(redisUrl, {
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    })
  : null;

if (redis) {
  redis.on("error", (error) => {
    console.error("Redis connection error:", error.message);
  });
}

export const closeRedis = async () => {
  await Promise.allSettled([redis?.quit(), bullConnection?.quit()]);
};
