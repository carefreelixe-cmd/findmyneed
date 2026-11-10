import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./config/database.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

try {
  const migration = await fs.readFile(
    path.join(currentDirectory, "database", "add_marketplace_catalog.sql"),
    "utf8",
  );
  await pool.query(migration);
  console.log("Marketplace catalog migration completed.");
} catch (error) {
  console.error("Marketplace catalog migration failed:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
