import bcrypt from "bcryptjs";
import { pool } from "./pool.js";
import { env } from "../config/env.js";

async function seedAdmin() {
  if (!env.adminPassword) {
    console.error(
      "✖ Set ADMIN_EMAIL and ADMIN_PASSWORD in your .env before seeding, then re-run `npm run seed:admin`.",
    );
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(env.adminPassword, 12);

  await pool.query(
    `INSERT INTO admin_users (email, password_hash)
     VALUES ($1, $2)
     ON CONFLICT (email)
     DO UPDATE SET password_hash = EXCLUDED.password_hash, updated_at = now()`,
    [env.adminEmail.toLowerCase(), passwordHash],
  );

  console.log(`✔ Admin account ready for ${env.adminEmail}`);
  console.log("  Change ADMIN_PASSWORD in .env after first login for security.");
  await pool.end();
}

seedAdmin().catch((err) => {
  console.error("✖ Seeding admin failed:", err);
  process.exit(1);
});
