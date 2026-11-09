# FindMyNeed marketplace

Full-stack local-services marketplace built with React, Express, MongoDB, Redis/BullMQ and Razorpay.

## Included

- Customer/provider sign-up and login with JWT authentication
- Searchable services, details, responsive booking and checkout flows
- Razorpay order creation and server-side signature verification
- Customer booking history and provider job dashboard
- MongoDB persistence with an in-memory development fallback
- BullMQ notification jobs when Redis is configured
- Helmet, CORS, rate limiting, Zod validation, password hashing and role access

## Run locally

1. Copy `.env.example` to `.env` and add credentials when needed.
2. Run `npm install`.
3. Run `npm run dev:all`.
4. Open `http://localhost:5173`.

MongoDB, Redis and Razorpay are optional for interface testing. Without MongoDB the API uses temporary memory. Without Redis jobs are logged. Without Razorpay keys checkout uses demo payment mode. Never use demo mode for a real deployment.

For production, set a strong `JWT_SECRET`, real database/Redis URLs, Razorpay live keys and the exact deployed `CLIENT_URL`. Use TLS, backups and monitoring, and connect the notification worker to email/SMS providers.

## Google sign-in

Create a Google OAuth 2.0 **Web application** client and add `http://localhost:5173` as an authorized JavaScript origin. Put the same client ID in `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID` inside `.env`, then restart both servers. The secret is not required for Google Identity Services ID-token login and must never be placed in a `VITE_` variable.
