import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./config/database.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

try {
  const migration = await fs.readFile(
    path.join(currentDirectory, "database", "add_scalability.sql"),
    "utf8",
  );
  await pool.query(migration);
  console.log("Scalability migration completed.");
} catch (error) {
  console.error("Scalability migration failed:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
