import { env, isMockPayments } from "../config/env.js";

const CASHFREE_BASE_URL =
  env.cashfreeEnv === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

function cashfreeHeaders() {
  return {
    "Content-Type": "application/json",
    "x-api-version": "2023-08-01",
    "x-client-id": env.cashfreeAppId,
    "x-client-secret": env.cashfreeSecretKey,
  };
}

/**
 * Creates a payment order. In mock mode (no Cashfree credentials configured)
 * this returns a fake session immediately so the whole flow can be
 * demoed/developed without a payment gateway account.
 */
export async function createPaymentOrder({ orderId, amount, customer, returnUrl }) {
  if (isMockPayments) {
    return {
      orderId,
      paymentSessionId: `mock_session_${orderId}`,
      isMock: true,
    };
  }

  const res = await fetch(`${CASHFREE_BASE_URL}/orders`, {
    method: "POST",
    headers: cashfreeHeaders(),
    body: JSON.stringify({
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: customer.id,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
      },
      order_meta: {
        return_url: returnUrl,
      },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const message = data?.message || "Failed to create Cashfree order.";
    throw new Error(message);
  }

  return {
    orderId: data.order_id,
    paymentSessionId: data.payment_session_id,
    isMock: false,
  };
}

/**
 * Verifies the payment status of an order. Mock orders are always
 * considered PAID (they were "paid" the moment they were created), which
 * mirrors what happens in the sandbox during local development.
 */
export async function verifyPaymentOrder(orderId) {
  if (isMockPayments || orderId.startsWith("mock_") || orderId.includes("mock")) {
    return { orderId, paymentStatus: "PAID", isMock: true };
  }

  const res = await fetch(`${CASHFREE_BASE_URL}/orders/${encodeURIComponent(orderId)}`, {
    method: "GET",
    headers: cashfreeHeaders(),
  });
  const data = await res.json();
  if (!res.ok) {
    const message = data?.message || "Failed to verify Cashfree order.";
    throw new Error(message);
  }

  // order_status: ACTIVE | PAID | EXPIRED | TERMINATED
  const statusMap = { PAID: "PAID", EXPIRED: "FAILED", TERMINATED: "FAILED" };
  return {
    orderId: data.order_id,
    paymentStatus: statusMap[data.order_status] || "PENDING",
    isMock: false,
  };
}
