import bcrypt from 'bcryptjs';
import validator from 'validator';
import crypto from 'crypto';
import { sendNewPasswordEmail } from '../utils/mailer.js';
import {
  findUserByEmail,
  findUserById,
  createUser,
  updateUserPassword,
} from '../models/userModel.js';
import { signAuthToken, generateResetToken, hashToken } from '../utils/token.js';

const SALT_ROUNDS = 12;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  mobile: user.mobile,
});

// POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ message: 'Name, email, mobile and password are all required.' });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }
    if (!/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ message: 'Mobile number must be exactly 10 digits.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await createUser({ name, email, mobile, passwordHash });

    const token = signAuthToken({ sub: user.id });
    res.cookie('token', token, cookieOptions);

    res.status(201).json({ message: 'Registration successful.', token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = signAuthToken({ sub: user.id });
    res.cookie('token', token, cookieOptions);

    res.status(200).json({ message: 'Login successful.', token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
export const logout = async (req, res) => {
  res.clearCookie('token', { ...cookieOptions, maxAge: 0 });
  res.status(200).json({ message: 'Logged out.' });
};

// GET /api/auth/me
export const me = async (req, res, next) => {
  try {
    const user = await findUserById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.status(200).json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/forgot-password
// Always responds with a generic success message so we never reveal
// whether a given email is registered.
// POST /api/auth/forgot-password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({
        message: 'Please provide a valid email address.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check whether the user exists
    const user = await findUserByEmail(normalizedEmail);

    // User does not exist
    if (!user) {
      return res.status(404).json({
        message: 'User is not found in the database.',
      });
    }

    // Generate a random password
    const newPassword = crypto
      .randomBytes(6)
      .toString('base64')
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 10);

    // Hash the new password before storing it
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Store the new password hash in the database
    await updateUserPassword(user.id, passwordHash);

    try {
      // Send the new password to the registered email
      await sendNewPasswordEmail(
        user.email,
        user.name,
        newPassword
      );
    } catch (emailError) {
      console.error('Email sending failed:', emailError);

      // Optional but recommended:
      // If email fails, don't leave the user with a password
      // they never received.
      return res.status(500).json({
        message: 'Unable to send the reset email. Please try again later.',
      });
    }

    return res.status(200).json({
      message: 'A new password has been sent to your registered email address.',
    });

  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset-password
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const tokenHash = hashToken(token);
    const resetRecord = await findValidResetToken(tokenHash);
    if (!resetRecord) {
      return res.status(400).json({ message: 'This reset link is invalid or has expired.' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    await updateUserPassword(resetRecord.user_id, passwordHash);
    await markResetTokenUsed(resetRecord.id);

    res.status(200).json({ message: 'Password has been reset. You can now log in.' });
  } catch (err) {
    next(err);
  }
};
