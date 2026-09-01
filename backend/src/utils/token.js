import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const signAuthToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

export const verifyAuthToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

// Generates a random reset token; returns both the raw token (sent to user)
// and its SHA-256 hash (stored in DB), so the DB never holds the raw secret.
export const generateResetToken = () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  return { rawToken, tokenHash };
};

export const hashToken = (rawToken) =>
  crypto.createHash('sha256').update(rawToken).digest('hex');
