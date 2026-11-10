# Production security checklist

Use this checklist before accepting real customers or payments.

## Secrets and environment

- [ ] Generate a long random `JWT_SECRET`; never reuse the development value.
- [ ] Store database, Redis, Elasticsearch and SMTP credentials in a secret manager.
- [ ] Keep `.env` out of Git and rotate any credential that was previously committed.
- [ ] Use separate credentials and databases for development, staging and production.
- [ ] Give every service account only the permissions it requires.

## Network and transport

- [ ] Serve the API and frontend only through HTTPS.
- [ ] Keep PostgreSQL, Redis and Elasticsearch on private networks.
- [ ] Require Redis authentication and TLS in production.
- [ ] Require Elasticsearch TLS and a restricted API key.
- [ ] Replace `FRONTEND_URL` with the exact production origins; do not use `*` with credentials.
- [ ] Put the API behind a maintained reverse proxy or load balancer.

## Authentication

- [ ] Add email verification before enabling sensitive customer actions.
- [ ] Implement short-lived access tokens and rotating refresh tokens in secure HttpOnly cookies.
- [ ] Add password-reset tokens that are hashed in the database, single-use and short-lived.
- [ ] Add MFA for administrators.
- [ ] Rate-limit login, registration, password reset and verification separately by IP and account.
- [ ] Record failed logins and alert on credential-stuffing patterns.
- [ ] Remove or disable frontend demo login in production.

## Authorization and data access

- [ ] Test every admin/provider/customer route with the wrong role and without authentication.
- [ ] Confirm providers can change only their own services, bookings and documents.
- [ ] Confirm customers can read only their own bookings, payments and notifications.
- [ ] Use allow-listed fields for updates instead of passing request bodies directly into SQL.
- [ ] Validate UUIDs, dates, prices, pagination limits and enum values before querying.

## Payments and financial operations

- [ ] Never accept a final price, commission or payment status directly from the browser.
- [ ] Calculate prices and commissions from database records inside a transaction.
- [ ] Verify payment-provider webhook signatures using the raw request body.
- [ ] Store webhook event IDs and reject duplicate events idempotently.
- [ ] Never store full card numbers, CVV values or payment secrets.
- [ ] Reconcile provider payouts against immutable payment records.

## Uploads and content

- [ ] Store uploads outside the application server or in private object storage.
- [ ] Enforce byte limits, extension allow-lists and detected MIME types.
- [ ] Generate random storage names; never trust the original filename as a path.
- [ ] Scan provider documents and user uploads for malware.
- [ ] Use signed, expiring URLs for private documents.
- [ ] Escape user content before inserting it into HTML emails or rendered pages.

## Database and queues

- [ ] Use PgBouncer or another connection pooler for multiple API replicas.
- [ ] Back up PostgreSQL automatically and test restoration.
- [ ] Monitor slow queries, deadlocks, connection saturation and replication lag.
- [ ] Monitor BullMQ failed jobs and configure alerts for exhausted retries.
- [ ] Alert on old `pending` or `failed` rows in `outbox_events`.
- [ ] Schedule cleanup for expired `idempotency_keys` and completed job history.
- [ ] Keep external API calls outside database transactions.

## Email and communications

- [ ] Configure SPF, DKIM and DMARC for the sending domain.
- [ ] Use a dedicated transactional email subdomain.
- [ ] Set `EMAIL_DELIVERY_ENABLED=true` only after SMTP testing.
- [ ] Do not log passwords, reset tokens, SMTP credentials or full email bodies.
- [ ] Provide unsubscribe handling for marketing email; never classify it as transactional.

## Monitoring and release safety

- [ ] Send structured logs to a protected centralized log service.
- [ ] Add error monitoring and redact authorization headers, cookies and personal information.
- [ ] Track request IDs through API, worker and external-provider calls.
- [ ] Run tests, builds and `npm audit --omit=dev` in CI.
- [ ] Add dependency update automation and review major upgrades.
- [ ] Maintain an incident-response and credential-rotation procedure.
- [ ] Run an independent penetration test before processing real payments.
