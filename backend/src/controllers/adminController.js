import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { query } from "../db/pool.js";
import { env } from "../config/env.js";
import { sendAdminPasswordResetEmail, sendAdminPasswordChangedEmail } from "../services/email.js";

const RESET_TOKEN_TTL_MINUTES = 30;

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

const loginSchema = z.object({
  email: z.string().trim().email().optional(),
  password: z.string().min(1, "Password is required."),
});

/**
 * Login accepts either just a password (matching the existing single
 * -password admin gate in the frontend) or an email + password pair.
 * When only a password is sent, it's checked against ADMIN_EMAIL's account.
 */
export async function login(req, res, next) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Password is required." });
    }
    const email = (parsed.data.email || env.adminEmail).toLowerCase();
    const { password } = parsed.data;

    const { rows } = await query(
      `SELECT id, password_hash FROM admin_users WHERE email = $1`,
      [email],
    );
    const admin = rows[0];
    if (!admin) return res.status(401).json({ error: "Invalid credentials." });

    const ok = await bcrypt.compare(password, admin.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials." });

    req.session.adminId = admin.id;
    req.session.adminEmail = email;
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export function logout(req, res, next) {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie("phantasm.sid");
    res.json({ ok: true });
  });
}

export function session(req, res) {
  res.json({ authenticated: Boolean(req.session?.adminId) });
}

export async function listRegistrations(req, res, next) {
  try {
    const regsResult = await query(
      `SELECT id, phantasm_id, college_name, department, year, contact_name,
              contact_email, contact_phone, is_pass, needs_accommodation,
              total_amount, payment_status, created_at
         FROM registrations
        ORDER BY created_at DESC`,
    );

    const entriesResult = await query(
      `SELECT id, registration_id, event_id, event_name, event_type, team_name, amount
         FROM event_entries
        ORDER BY created_at ASC`,
    );

    const participantsResult = await query(
      `SELECT id, event_entry_id, name, email, phone FROM participants ORDER BY created_at ASC`,
    );

    const participantsByEntry = new Map();
    for (const p of participantsResult.rows) {
      const list = participantsByEntry.get(p.event_entry_id) ?? [];
      list.push(p);
      participantsByEntry.set(p.event_entry_id, list);
    }

    const entriesByRegistration = new Map();
    for (const e of entriesResult.rows) {
      const list = entriesByRegistration.get(e.registration_id) ?? [];
      list.push({ ...e, participants: participantsByEntry.get(e.id) ?? [] });
      entriesByRegistration.set(e.registration_id, list);
    }

    const registrations = regsResult.rows.map((r) => ({
      id: r.id,
      phantasm_id: r.phantasm_id,
      college_name: r.college_name,
      department: r.department,
      year: r.year,
      contact_name: r.contact_name,
      contact_email: r.contact_email,
      contact_phone: r.contact_phone,
      pass_type: r.is_pass ? "pass" : "single",
      needs_accommodation: r.needs_accommodation,
      total_amount: r.total_amount,
      payment_status: r.payment_status,
      created_at: r.created_at,
      events: entriesByRegistration.get(r.id) ?? [],
    }));

    const paidRegs = registrations.filter((r) => r.payment_status === "paid");
    const stats = {
      registrationsCount: paidRegs.length,
      eventEntriesCount: paidRegs.reduce((sum, r) => sum + r.events.length, 0),
      revenue: paidRegs.reduce((sum, r) => sum + r.total_amount, 0),
    };

    res.json({ registrations, stats });
  } catch (err) {
    next(err);
  }
}

const forgotSchema = z.object({ email: z.string().trim().email("Enter a valid email.") });

/**
 * Forgot-password: emails the admin a time-limited link with instructions
 * to set a new password. Always responds 200 (even if the email doesn't
 * match an account) so the endpoint can't be used to enumerate accounts.
 */
export async function forgotPassword(req, res, next) {
  try {
    const parsed = forgotSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Enter a valid email." });
    }
    const email = parsed.data.email.toLowerCase();

    const { rows } = await query(`SELECT id FROM admin_users WHERE email = $1`, [email]);
    const admin = rows[0];

    if (admin) {
      const token = crypto.randomBytes(32).toString("hex");
      const tokenHash = hashToken(token);
      const expires = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

      await query(
        `UPDATE admin_users SET reset_token_hash = $1, reset_token_expires = $2, updated_at = now() WHERE id = $3`,
        [tokenHash, expires, admin.id],
      );

      const resetUrl = `${env.frontendUrl.replace(/\/$/, "")}/admin?reset_token=${token}`;
      try {
        await sendAdminPasswordResetEmail({
          to: email,
          resetUrl,
          expiresInMinutes: RESET_TOKEN_TTL_MINUTES,
        });
      } catch (mailErr) {
        console.error("Failed to send password reset email:", mailErr);
      }
    }

    res.json({
      ok: true,
      message:
        "If that email is registered, instructions to change your password have been sent.",
    });
  } catch (err) {
    next(err);
  }
}

const resetSchema = z.object({
  token: z.string().min(1, "Reset token is required."),
  newPassword: z.string().min(8, "New password must be at least 8 characters."),
});

export async function resetPassword(req, res, next) {
  try {
    const parsed = resetSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request." });
    }
    const { token, newPassword } = parsed.data;
    const tokenHash = hashToken(token);

    const { rows } = await query(
      `SELECT id, email FROM admin_users
        WHERE reset_token_hash = $1 AND reset_token_expires > now()`,
      [tokenHash],
    );
    const admin = rows[0];
    if (!admin) {
      return res.status(400).json({ error: "This reset link is invalid or has expired." });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await query(
      `UPDATE admin_users
          SET password_hash = $1, reset_token_hash = NULL, reset_token_expires = NULL, updated_at = now()
        WHERE id = $2`,
      [passwordHash, admin.id],
    );

    sendAdminPasswordChangedEmail({ to: admin.email }).catch((err) =>
      console.error("Failed to send password-changed notice:", err),
    );

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
