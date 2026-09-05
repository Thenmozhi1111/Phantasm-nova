import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import registrationRoutes from './routes/registration.js';
import paymentRoutes from './routes/payment.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

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

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/auth', authRoutes);
app.use('/api', registrationRoutes);
app.use('/api', paymentRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
