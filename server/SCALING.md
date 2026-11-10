# Backend scalability and safety

PostgreSQL remains the source of truth. Redis/BullMQ handles asynchronous work,
and Elasticsearch accelerates text search. If Redis or Elasticsearch is absent,
the API still starts and search falls back to PostgreSQL.

## 1. Apply the database migrations

```powershell
cd C:\Users\USER\Downloads\findmyneed\server
npm run migrate-marketplace
npm run migrate-scalability
```

The scalability migration adds database idempotency records, a transactional
outbox, full-text indexes, and composite service-search indexes.

## 2. Configure optional infrastructure

Copy the Redis and Elasticsearch settings from `.env.example` into `.env`:

```dotenv
REDIS_URL=redis://localhost:6379
WORKER_CONCURRENCY=10
OUTBOX_POLL_INTERVAL_MS=2000
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_API_KEY=
ELASTICSEARCH_SERVICES_INDEX=marketplace-services
```

Never commit `.env`. Use a secret manager in production. Redis should require
authentication and TLS outside a private network. Elasticsearch should also use
TLS and an API key with access restricted to the marketplace index.

## 3. Start each process

Use separate terminals or process-manager services:

```powershell
# API
npm run start

# BullMQ worker and transactional-outbox publisher
npm run worker

# Initial Elasticsearch index build, and after a full data import
npm run search:reindex
```

Run multiple API and worker processes behind a load balancer. They are safe to
scale horizontally: BullMQ distributes jobs, and the outbox publisher uses
`FOR UPDATE SKIP LOCKED` so instances do not publish the same event concurrently.

## 4. Idempotent API requests

Send a unique key on every POST, PUT, PATCH, or DELETE that may be retried:

```http
Idempotency-Key: 7c3c7ce0-78d8-42d5-a975-77b21ec0af4f
```

The same key and payload return the saved response with
`Idempotency-Replayed: true`. Reusing the key with a different payload returns
HTTP 409. Keys expire after 24 hours. A client should generate one UUID per user
action and reuse it only when retrying that exact action.

## 5. Database transactions

Use `withTransaction` whenever one business operation changes multiple rows:

```js
import { withTransaction } from "./config/database.js";

const result = await withTransaction(async (client) => {
  const booking = await client.query("INSERT ... RETURNING *", values);
  await client.query("INSERT INTO outbox_events ...", eventValues);
  return booking.rows[0];
});
```

A single SQL INSERT/UPDATE/DELETE is already atomic and does not need an extra
transaction. Never perform email, payment-provider, Redis, or Elasticsearch calls
inside a database transaction. Write an outbox event in the transaction and let
the worker perform the external operation afterward.

## 6. Deployment rules

- Put PostgreSQL behind connection pooling such as PgBouncer.
- Set the API replica count independently from the worker replica count.
- Configure load-balancer timeouts and health checks on
  `/api/marketplace/health`.
- Back up PostgreSQL and test restores regularly.
- Monitor failed BullMQ jobs, outbox rows in `failed`, database pool saturation,
  API latency, and Elasticsearch cluster health.
- Use HTTPS, rotate JWT and infrastructure credentials, and keep production CORS
  origins explicit.
- Run `npm audit --omit=dev` in CI and block releases with known production
  vulnerabilities.

## 7. Transactional email

Email is delivered by the BullMQ worker rather than API requests. Configure SMTP
in `.env`, then enable delivery only after testing:

```dotenv
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-smtp-user
EMAIL_PASSWORD=your-smtp-password
EMAIL_FROM=FindMyNeed <noreply@example.com>
EMAIL_SECURE=false
EMAIL_DELIVERY_ENABLED=true
EMAIL_MAX_CONNECTIONS=5
EMAIL_MAX_MESSAGES=100
```

When `EMAIL_DELIVERY_ENABLED=false`, workers render and log a safe preview event
without contacting SMTP. Templates currently cover welcome, provider application,
booking request, booking confirmation, booking status, password reset, provider
approval and general notifications. Add templates in `services/emailTemplates.js`
and enqueue `notification.send` with `notificationId`, `templateKey` and `data`.

Set up SPF, DKIM and DMARC before sending from a production domain. Keep marketing
email separate from transactional email and implement unsubscribe preferences for
marketing messages.
