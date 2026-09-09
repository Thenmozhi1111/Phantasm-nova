import crypto from "node:crypto";
import { env } from "../config/env.js";

const RAZORPAY_BASE_URL = "https://api.razorpay.com/v1";

function razorpayHeaders() {
  const auth = Buffer.from(
    `${env.razorpayKeyId}:${env.razorpayKeySecret}`,
  ).toString("base64");

  return {
    "Content-Type": "application/json",
    Authorization: `Basic ${auth}`,
  };
}

function requireCredentials() {
  if (!env.razorpayKeyId || !env.razorpayKeySecret) {
    throw new Error(
      "Razorpay credentials are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in the backend .env file.",
    );
  }
}

/**
 * Creates a Razorpay order.
 *
 * Razorpay expects the amount in the smallest currency unit.
 * For INR:
 *
 * ₹100 = 10000 paise
 */
export async function createPaymentOrder({
  orderId,
  amount,
  customer,
}) {
  requireCredentials();

  const amountInPaise = Math.round(Number(amount) * 100);

  if (!Number.isInteger(amountInPaise) || amountInPaise <= 0) {
    throw new Error("Invalid payment amount.");
  }

  const receipt = String(orderId).slice(0, 40);

  const res = await fetch(`${RAZORPAY_BASE_URL}/orders`, {
    method: "POST",
    headers: razorpayHeaders(),
    body: JSON.stringify({
      amount: amountInPaise,
      currency: "INR",
      receipt,

      notes: {
        registration_id: customer.id,
        customer_name: customer.name,
        customer_email: customer.email,
      },
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      data?.error?.description ||
      data?.error?.reason ||
      "Failed to create Razorpay order.";

    throw new Error(message);
  }

  return {
    orderId: data.id,
    amount: data.amount,
    currency: data.currency,
    isMock: false,
  };
}

/**
 * Verifies Razorpay's checkout signature.
 *
 * Signature:
 *
 * HMAC_SHA256(
 *   razorpay_order_id + "|" + razorpay_payment_id,
 *   Razorpay Secret
 * )
 */
export function verifyRazorpaySignature({
  orderId,
  paymentId,
  signature,
}) {
  requireCredentials();

  const expected = crypto
    .createHmac("sha256", env.razorpayKeySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const actual = Buffer.from(String(signature), "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  if (actual.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, actual);
}

/**
 * Gets the payment directly from Razorpay.
 *
 * This is an additional server-side check after
 * signature verification.
 */
export async function fetchPayment(paymentId) {
  requireCredentials();

  const res = await fetch(
    `${RAZORPAY_BASE_URL}/payments/${encodeURIComponent(paymentId)}`,
    {
      method: "GET",
      headers: razorpayHeaders(),
    },
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      data?.error?.description ||
      data?.error?.reason ||
      "Failed to fetch Razorpay payment.";

    throw new Error(message);
  }

  return data;
}