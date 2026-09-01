import pg from "pg";
import { env } from "../config/env.js";

const { Pool } = pg;

const poolConfig = env.databaseUrl
  ? {
      connectionString: env.databaseUrl,
      ssl: env.pgSsl ? { rejectUnauthorized: false } : false,
    }
  : {
      host: env.pgHost,
      port: env.pgPort,
      user: env.pgUser,
      password: env.pgPassword,
      database: env.pgDatabase,
      ssl: env.pgSsl ? { rejectUnauthorized: false } : false,
    };

export const pool = new Pool({
  ...poolConfig,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

pool.on("error", (err) => {
  // Errors on idle clients shouldn't crash the process.
  console.error("Unexpected PostgreSQL client error:", err);
});

/**
 * Run a query using the shared pool.
 */
export function query(text, params) {
  return pool.query(text, params);
}

/**
 * Run a series of statements inside a single transaction.
 * `fn` receives a connected client; use client.query(...) inside it.
 */
export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
