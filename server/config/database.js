import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

export const query = (text, params) => pool.query(text, params);

export const withTransaction = async (callback, options = {}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (options.isolationLevel) {
      const allowedLevels = new Set([
        "READ COMMITTED",
        "REPEATABLE READ",
        "SERIALIZABLE",
      ]);
      const level = options.isolationLevel.toUpperCase();

      if (!allowedLevels.has(level)) {
        throw new Error("Unsupported transaction isolation level");
      }

      await client.query(`SET TRANSACTION ISOLATION LEVEL ${level}`);
    }

    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export default pool;
