import "dotenv/config";

function bool(value, fallback = false) {
  if (value === undefined || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

function list(value) {
  return (value ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProd: process.env.NODE_ENV === "production",
  port: Number(process.env.PORT) || 4000,
  corsOrigins: list(process.env.CORS_ORIGIN || "http://localhost:5173"),

  databaseUrl: process.env.DATABASE_URL || "",
  pgHost: process.env.PGHOST || "localhost",
  pgPort: Number(process.env.PGPORT) || 5432,
  pgUser: process.env.PGUSER || "postgres",
  pgPassword: process.env.PGPASSWORD || "phantasm_pass",
  pgDatabase: process.env.PGDATABASE || "phantasm",
  pgSsl: bool(process.env.PGSSL, false),

  sessionSecret: process.env.SESSION_SECRET || "dev-only-insecure-secret",

  adminEmail: process.env.ADMIN_EMAIL || "admin@phantasm.fest",
  adminPassword: process.env.ADMIN_PASSWORD || "",

  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: Number(process.env.SMTP_PORT) || 587,
  smtpSecure: bool(process.env.SMTP_SECURE, false),
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  smtpFrom: process.env.SMTP_FROM || "Phantasm 2026 <no-reply@phantasm.fest>",

  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",

  cashfreeAppId: process.env.CASHFREE_APP_ID || "",
  cashfreeSecretKey: process.env.CASHFREE_SECRET_KEY || "",
  cashfreeEnv: process.env.CASHFREE_ENV === "production" ? "production" : "sandbox",
};

export const isMockPayments = !env.cashfreeAppId || !env.cashfreeSecretKey;
export const isMockEmail = !env.smtpHost || !env.smtpUser || !env.smtpPass;
