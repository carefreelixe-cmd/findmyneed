import "dotenv/config";
import { Worker } from "bullmq";
import { bullConnection, redisEnabled, closeRedis } from "./config/redis.js";
import {
  indexService,
  removeIndexedService,
} from "./services/searchService.js";
import { withTransaction } from "./config/database.js";
import { enqueue } from "./queues/queues.js";
import {
  closeEmailTransport,
  sendNotificationEmail,
} from "./services/emailService.js";

if (!redisEnabled) {
  console.error("REDIS_URL is required to run the BullMQ worker");
  process.exit(1);
}

const worker = new Worker(
  "marketplace",
  async (job) => {
    switch (job.name) {
      case "notification.send":
        return sendNotificationEmail(job.data);
      case "search.index-service":
        await indexService(job.data.service);
        return { indexed: true };
      case "search.remove-service":
        await removeIndexedService(job.data.serviceId);
        return { removed: true };
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  },
  {
    connection: bullConnection,
    concurrency: Number(process.env.WORKER_CONCURRENCY || 10),
  },
);

worker.on("completed", (job) => console.log(`Job ${job.id} completed`));
worker.on("failed", (job, error) =>
  console.error(`Job ${job?.id} failed:`, error.message),
);

const publishOutboxBatch = async () => {
  const events = await withTransaction(async (client) => {
    const selected = await client.query(
      `SELECT id, topic, payload
       FROM outbox_events
       WHERE status IN ('pending', 'failed') AND available_at <= CURRENT_TIMESTAMP
       ORDER BY created_at
       FOR UPDATE SKIP LOCKED
       LIMIT 100`,
    );

    if (selected.rowCount > 0) {
      await client.query(
        `UPDATE outbox_events SET status = 'processing', attempts = attempts + 1
         WHERE id = ANY($1::uuid[])`,
        [selected.rows.map((event) => event.id)],
      );
    }
    return selected.rows;
  });

  for (const event of events) {
    try {
      await enqueue(event.topic, event.payload, { jobId: event.id });
      await withTransaction((client) =>
        client.query(
          `UPDATE outbox_events
           SET status = 'published', processed_at = CURRENT_TIMESTAMP, last_error = NULL
           WHERE id = $1`,
          [event.id],
        ),
      );
    } catch (error) {
      await withTransaction((client) =>
        client.query(
          `UPDATE outbox_events
           SET status = 'failed', last_error = $2,
               available_at = CURRENT_TIMESTAMP + INTERVAL '30 seconds'
           WHERE id = $1`,
          [event.id, error.message.slice(0, 2000)],
        ),
      );
    }
  }
};

const outboxTimer = setInterval(
  () => {
    publishOutboxBatch().catch((error) =>
      console.error("Outbox publisher error:", error.message),
    );
  },
  Number(process.env.OUTBOX_POLL_INTERVAL_MS || 2000),
);

const shutdown = async () => {
  clearInterval(outboxTimer);
  await closeEmailTransport();
  await worker.close();
  await closeRedis();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
