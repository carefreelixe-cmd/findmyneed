import crypto from "crypto";
import { query } from "../config/database.js";

const mutationMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const hashRequest = (req) =>
  crypto
    .createHash("sha256")
    .update(JSON.stringify({ body: req.body, query: req.query }))
    .digest("hex");

export const idempotency = async (req, res, next) => {
  if (!mutationMethods.has(req.method)) return next();

  const key = req.get("idempotency-key");
  if (!key) return next();

  if (key.length < 16 || key.length > 255) {
    return res.status(400).json({
      message: "Idempotency-Key must contain between 16 and 255 characters",
    });
  }

  const requestHash = hashRequest(req);
  const requestPath = req.originalUrl.split("?")[0];
  const scopeUserId = req.user?.id || null;

  try {
    const inserted = await query(
      `INSERT INTO idempotency_keys
         (idempotency_key, user_id, request_method, request_path, request_hash)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      [key, scopeUserId, req.method, requestPath, requestHash],
    );

    if (inserted.rowCount === 0) {
      const existing = await query(
        `SELECT request_hash, response_status, response_body, state, locked_until
         FROM idempotency_keys
         WHERE idempotency_key = $1 AND request_method = $2 AND request_path = $3
           AND COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid) =
               COALESCE($4::uuid, '00000000-0000-0000-0000-000000000000'::uuid)`,
        [key, req.method, requestPath, scopeUserId],
      );
      const record = existing.rows[0];

      if (!record || record.request_hash !== requestHash) {
        return res.status(409).json({
          message: "This idempotency key was already used for another request",
        });
      }

      if (record.state === "completed") {
        res.setHeader("idempotency-replayed", "true");
        return res.status(record.response_status).json(record.response_body);
      }

      return res.status(409).json({
        message: "An identical request is already being processed",
        retryAfterSeconds: 2,
      });
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      const state = res.statusCode >= 500 ? "failed" : "completed";
      query(
        `UPDATE idempotency_keys
         SET response_status = $1, response_body = $2, state = $3,
             updated_at = CURRENT_TIMESTAMP
         WHERE idempotency_key = $4 AND request_method = $5 AND request_path = $6
           AND COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid) =
               COALESCE($7::uuid, '00000000-0000-0000-0000-000000000000'::uuid)`,
        [
          res.statusCode,
          body,
          state,
          key,
          req.method,
          requestPath,
          scopeUserId,
        ],
      ).catch((error) =>
        console.error("Idempotency persistence error:", error),
      );
      return originalJson(body);
    };

    next();
  } catch (error) {
    console.error("Idempotency middleware error:", error);
    next(error);
  }
};
