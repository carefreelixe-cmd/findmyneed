import { Queue } from "bullmq";
import { bullConnection, redisEnabled } from "../config/redis.js";

const defaultJobOptions = {
  attempts: 5,
  backoff: { type: "exponential", delay: 1000 },
  removeOnComplete: { age: 86400, count: 1000 },
  removeOnFail: { age: 604800, count: 5000 },
};

export const marketplaceQueue = redisEnabled
  ? new Queue("marketplace", {
      connection: bullConnection,
      defaultJobOptions,
    })
  : null;

export const enqueue = async (name, data, options = {}) => {
  if (!marketplaceQueue) return null;
  return marketplaceQueue.add(name, data, options);
};

export const closeQueues = async () => {
  await marketplaceQueue?.close();
};
