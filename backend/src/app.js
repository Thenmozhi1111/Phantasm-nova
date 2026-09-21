import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import authRoutes from './routes/authRoutes.js';
import registrationRoutes from './routes/registration.js';
import paymentRoutes from './routes/payment.js';
import adminRoutes from './routes/admin.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { pool } from './db/pool.js';
import { env } from './config/env.js';

dotenv.config();

const app = express();

// Render (and most PaaS hosts) sit behind a reverse proxy, so Express sees
// every request as coming from the proxy's internal IP. Without this,
// express-rate-limit can't identify real clients correctly (and in newer
// versions throws on the X-Forwarded-For header instead of trusting it),
// and secure cookies/req.ip-based logic can misbehave.
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// CORS_ORIGIN can be a single URL or a comma-separated list of URLs.
// Falls back to the local Vite dev server so `npm run dev` works out of the box.
const allowedOrigins = (process.env.CORS_ORIGIN || 'https://phantasm-nova.vercel.app')
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

// Session store for the admin dashboard (adminController login/session).
// Backed by the `session` table created in db/schema.sql via
// connect-pg-simple, so admin sessions survive a server restart/redeploy.
const PgSession = connectPgSimple(session);
app.use(
  session({
    store: new PgSession({ pool, tableName: 'session', createTableIfMissing: true }),
    name: 'phantasm.sid',
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    proxy: env.isProd,
    cookie: {
      httpOnly: true,
      secure: env.isProd,
      // Admin dashboard and API commonly live on different origins
      // (e.g. Vercel frontend + Render backend), which requires
      // SameSite=None for the cookie to be sent cross-site.
      sameSite: env.isProd ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  }),
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
