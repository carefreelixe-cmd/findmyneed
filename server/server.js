import express from "express";
import cors from "cors";
import compression from "compression";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import adminFeaturesRoutes from "./routes/adminFeatures.js";
import providerRoutes from "./routes/provider.js";
import customerRoutes from "./routes/customer.js";
import marketplaceRoutes from "./routes/marketplace.js";
import pool from "./config/database.js";
import { closeRedis } from "./config/redis.js";
import { closeQueues } from "./queues/queues.js";
import { idempotency } from "./middleware/idempotency.js";
import { requestContext } from "./middleware/requestContext.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.set("trust proxy", 1);
app.disable("x-powered-by");

// Middleware
app.use(helmet());
app.use(compression());
app.use(requestContext);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin))
        return callback(null, true);
      return callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: Number(process.env.RATE_LIMIT_MAX || 300),
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
);
app.use(idempotency);

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Services Marketplace API",
    version: "1.0.0",
    status: "running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/features", adminFeaturesRoutes);
app.use("/api/provider", providerRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/marketplace", marketplaceRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

try {
  const database = await pool.query("SELECT current_database() AS name");
  console.log(`Database connected: ${database.rows[0].name}`);
} catch (error) {
  console.error("Database connection failed:", error.message);
  process.exit(1);
}

const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
});

const shutdown = async (signal) => {
  console.log(`${signal} received; shutting down safely`);
  server.close(async () => {
    await Promise.allSettled([closeQueues(), closeRedis(), pool.end()]);
    process.exit(0);
  });

  setTimeout(() => process.exit(1), 10000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
