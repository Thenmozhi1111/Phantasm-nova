import { query } from '../config/db.js';

export const findUserByEmail = async (email) => {
  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
  return rows[0] || null;
};

export const findUserById = async (id) => {
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] || null;
};

export const createUser = async ({ name, email, mobile, passwordHash }) => {
  const { rows } = await query(
    `INSERT INTO users (name, email, mobile, password_hash)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, mobile, created_at`,
    [name, email.toLowerCase(), mobile, passwordHash]
  );
  return rows[0];
};

export const updateUserPassword = async (userId, passwordHash) => {
  await query(
    `UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2`,
    [passwordHash, userId]
  );
};

export const createPasswordResetToken = async (userId, tokenHash, expiresAt) => {
  await query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  );
};

export const findValidResetToken = async (tokenHash) => {
  const { rows } = await query(
    `SELECT * FROM password_reset_tokens
     WHERE token_hash = $1 AND used = false AND expires_at > now()`,
    [tokenHash]
  );
  return rows[0] || null;
};

export const markResetTokenUsed = async (id) => {
  await query('UPDATE password_reset_tokens SET used = true WHERE id = $1', [id]);
};
