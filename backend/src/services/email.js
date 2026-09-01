import nodemailer from "nodemailer";
import { env, isMockEmail } from "../config/env.js";

let transporter = null;

function getTransporter() {
  if (isMockEmail) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure, // true for port 465, false for other ports (STARTTLS)
      auth: { user: env.smtpUser, pass: env.smtpPass },
    });
  }
  return transporter;
}

/**
 * Sends an email. If SMTP isn't configured (local/dev), the message is
 * logged to the console instead of failing, so the rest of the app keeps
 * working without a mail account.
 */
async function sendMail({ to, subject, html, text }) {
  const t = getTransporter();
  if (!t) {
    console.log("\n───── [DEV EMAIL — SMTP not configured] ─────");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log(text || html);
    console.log("───────────────────────────────────────────\n");
    return { mocked: true };
  }

  await t.sendMail({
    from: env.smtpFrom,
    to,
    subject,
    html,
    text,
  });
  return { mocked: false };
}

function layout(title, bodyHtml) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <style>
      :root {
        color-scheme: light dark;
        supported-color-schemes: light dark;
      }
      @media (prefers-color-scheme: dark) {
        .bg-body { background-color: #02040a !important; }
        .bg-card { background-color: #0b1120 !important; border-color: rgba(56,189,248,0.25) !important; color: #e0f2fe !important; }
        .txt-main { color: #f0f9ff !important; }
        .txt-sub { color: #64748b !important; }
        .txt-brand { color: #38bdf8 !important; }
        .id-card { border-color: rgba(56,189,248,0.4) !important; background-color: transparent !important; }
      }
    </style>
  </head>
  <body class="bg-body" style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background-color:#ffffff;color:#0f172a;">
    <div style="padding:32px 16px;">
      <div class="bg-card" style="max-width:520px;margin:0 auto;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:32px;color:#0f172a;">
        <p class="txt-brand" style="letter-spacing:4px;font-size:11px;color:#0284c7;text-transform:uppercase;margin:0 0 4px;font-weight:bold;">Phantasm 2026</p>
        <h1 class="txt-main" style="font-size:20px;margin:0 0 16px;color:#0f172a;">${title}</h1>
        ${bodyHtml}
        <p class="txt-sub" style="margin-top:32px;font-size:11px;color:#64748b;">This is an automated message from Phantasm 2026 registrations. Please do not reply to this email.</p>
      </div>
    </div>
  </body>
  </html>`;
}

export async function sendRegistrationConfirmationEmail({
  to,
  contactName,
  phantasmId,
  registrationId,
  totalAmount,
  isPass,
  events,
}) {
const eventRows = events
    .map((e) => {
      const teamDetail = e.teamName
        ? ` — team "<strong>${e.teamName}</strong>"${
            e.teamMembers && e.teamMembers.length
              ? `<br><span style="font-size:12px;color:#64748b;margin-left:12px;display:inline-block;">👥 Teammates: ${e.teamMembers.join(", ")}</span>`
              : ""
          }`
        : "";

      // Shows specified time, or a default message if missing
      const timeDetail = `<br><span style="font-size:12px;color:#0284c7;margin-left:12px;display:inline-block;">🕒 Time: ${e.eventTime || "11:30"}</span>`;

      // Defaults to Optional unless explicitly true
      const laptopDetail = `<br><span style="font-size:12px;color:#64748b;margin-left:12px;display:inline-block;">💻 Laptop: ${e.requiresLaptop ? "Required" : "Optional"}</span>`;

      return `<li style="margin-bottom:12px;line-height:1.5;">
        <strong>${e.eventName}</strong> (₹${e.amount})${teamDetail}${timeDetail}${laptopDetail}
      </li>`;
    })
    .join("");

  const html = layout(
    "Your registration is confirmed 🎉",
    `
    <p>Hi ${contactName},</p>
    <p>Your payment has been received and your spot at Phantasm 2026 is confirmed.</p>
    ${
      phantasmId
        ? `<div class="id-card" style="margin:20px 0;padding:16px;border:1px dashed #0284c7;border-radius:12px;background-color:#f0f9ff;">
             <span class="txt-brand" style="display:block;font-size:10px;letter-spacing:2px;color:#0284c7;text-transform:uppercase;font-weight:bold;">Your Phantasm ID</span>
             <span class="txt-main" style="display:block;font-size:22px;font-weight:bold;margin-top:4px;color:#0f172a;">${phantasmId}</span>
           </div>`
        : ""
    }
    <p><strong>Registration:</strong> ${isPass ? "Full Fest Pass" : "Single Event(s)"}</p>
    <p><strong>Amount paid:</strong> ₹${totalAmount}</p>
    <p><strong>Registration ID:</strong> ${registrationId}</p>
    ${events.length ? `<p><strong>Registered Events:</strong></p><ul style="padding-left:20px;margin-top:8px;">${eventRows}</ul>` : ""}
    <p style="margin-top:20px;">Keep your Phantasm ID handy — you'll need it at check-in and if any teammate wants to look up your team when registering.</p>
    `,
  );

  const text = `Hi ${contactName},

Your payment has been received and your spot at Phantasm 2026 is confirmed.
${phantasmId ? `Phantasm ID: ${phantasmId}\n` : ""}Registration ID: ${registrationId}
Amount paid: Rs. ${totalAmount}
`;

  return sendMail({ to, subject: "Phantasm 2026 — Registration Confirmed", html, text });
}

export async function sendAdminPasswordResetEmail({ to, resetUrl, expiresInMinutes }) {
  const html = layout(
    "Reset your admin password",
    `
    <p>We received a request to reset the password for the Phantasm 2026 admin ledger.</p>
    <p style="margin:24px 0;">
      <a href="${resetUrl}" style="background:linear-gradient(180deg,#0ea5e9,#0369a1);color:#ffffff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:bold;letter-spacing:1px;text-transform:uppercase;font-size:13px;display:inline-block;">
        Change my password
      </a>
    </p>
    <p>Or copy this link into your browser:</p>
    <p style="word-break:break-all;font-size:12px;color:#0284c7;">${resetUrl}</p>
    <p style="margin-top:20px;font-size:13px;color:#64748b;">This link expires in ${expiresInMinutes} minutes. If you didn't request this, you can safely ignore this email — your password will not be changed.</p>
    `,
  );

  const text = `We received a request to reset the password for the Phantasm 2026 admin ledger.

Change your password here (expires in ${expiresInMinutes} minutes):
${resetUrl}

If you didn't request this, you can safely ignore this email.`;

  return sendMail({ to, subject: "Phantasm 2026 — Reset your admin password", html, text });
}

export async function sendAdminPasswordChangedEmail({ to }) {
  const html = layout(
    "Your admin password was changed",
    `<p>This is a confirmation that the password for the Phantasm 2026 admin ledger (${to}) was just changed.</p>
     <p style="font-size:13px;color:#64748b;">If you didn't make this change, please contact the fest tech team immediately.</p>`,
  );
  const text = `The password for the Phantasm 2026 admin ledger (${to}) was just changed. If you didn't make this change, contact the fest tech team immediately.`;
  return sendMail({ to, subject: "Phantasm 2026 — Admin password changed", html, text });
}