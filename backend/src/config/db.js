import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// If DATABASE_URL is provided, use it. Otherwise fall back to discrete PG* vars.
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({
      host: process.env.PGHOST || 'localhost',
      port: Number(process.env.PGPORT) || 5432,
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'azer',
      database: process.env.PGDATABASE || 'phantasm',
    });

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL error on idle client', err);
  process.exit(1);
});

export const query = (text, params) => pool.query(text, params);
export default pool;
