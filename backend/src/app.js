import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { pool } from './db/pool.js';
import authRoutes from './routes/authRoutes.js';
import registrationRoutes from './routes/registration.js';
import paymentRoutes from './routes/payment.js';
import adminRoutes from './routes/admin.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// Render (and most PaaS hosts) sit behind a reverse proxy, so Express sees
// every request as coming from the proxy's internal IP. Without this,
// express-rate-limit can't identify real clients correctly (and in newer
// versions throws on the X-Forwarded-For header instead of trusting it),
// and secure cookies/req.ip-based logic can misbehave.
if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
  app.set('trust proxy', 1);
}

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// CORS_ORIGIN can be a single URL or a comma-separated list of URLs.
// Falls back to the local Vite dev server so `npm run dev` works out of the box.
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (curl, Postman, server-to-server, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Admin dashboard sessions, stored in Postgres (see the "session" table in
// db/schema.sql) so they survive across serverless function instances on
// Vercel instead of living in memory on a single process.
const PgSession = connectPgSimple(session);
app.use(
  session({
    store: new PgSession({ pool, tableName: 'session', createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: 'phantasm.sid',
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      // 'none' is required when the frontend and backend are on different
      // domains (e.g. two separate Vercel projects) so the cookie is sent
      // on cross-site fetch() calls. Falls back to 'lax' for local dev
      // over http, where 'none' would be rejected without https.
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/auth', authRoutes);
app.use('/api', registrationRoutes);
app.use('/api', paymentRoutes);
app.use('/api', adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
