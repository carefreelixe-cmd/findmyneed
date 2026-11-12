import bcrypt from "bcryptjs";
import { query } from "./config/database.js";

const accounts = [
  { email: "test@gmail.com", role: "customer", password: "demo123" },
  { email: "provider@gmail.com", role: "provider", password: "demo123" },
  { email: "admin@marketplace.com", role: "admin", password: "admin123" },
];

try {
  for (const account of accounts) {
    const passwordHash = await bcrypt.hash(account.password, 10);
    const result = await query(
      `UPDATE users
       SET password_hash = $1, is_active = true, is_approved = true, updated_at = CURRENT_TIMESTAMP
       WHERE email = $2 AND role = $3
       RETURNING email, role`,
      [passwordHash, account.email, account.role],
    );

    if (result.rowCount !== 1) {
      throw new Error(`Missing ${account.role} demo account: ${account.email}`);
    }
  }

  console.log("Demo account credentials updated successfully.");
  process.exit(0);
} catch (error) {
  console.error("Unable to update demo accounts:", error.message);
  process.exit(1);
}
