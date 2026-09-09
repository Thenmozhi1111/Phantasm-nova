import { z } from "zod";
import { query, withTransaction } from "../db/pool.js";
import {
  createPaymentOrder,
  fetchPayment,
  verifyRazorpaySignature,
} from "../services/payment.js";
import { sendRegistrationConfirmationEmail } from "../services/email.js";

const createSchema = z.object({
  registrationId: z.string().uuid(),
});

export async function createPayment(req, res, next) {
  try {
    const parsed = createSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "registrationId is required.",
      });
    }

    const { registrationId } = parsed.data;

    const { rows } = await query(
      `SELECT id,
              contact_name,
              contact_email,
              contact_phone,
              total_amount,
              payment_status
         FROM registrations
        WHERE id = $1`,
      [registrationId],
    );

    const reg = rows[0];

    if (!reg) {
      return res.status(404).json({
        error: "Registration not found.",
      });
    }

    if (reg.payment_status === "paid") {
      return res.status(409).json({
        error: "This registration has already been paid for.",
      });
    }

    /*
     * Create a fresh Razorpay order for every checkout attempt.
     *
     * This means if a customer closes Razorpay and tries again,
     * a new Razorpay order can be created.
     */
    const localReceipt =
      `phx_${reg.id.replace(/-/g, "").slice(0, 24)}_${Date.now()}`;

    const order = await createPaymentOrder({
      orderId: localReceipt,

      amount: reg.total_amount,

      customer: {
        id: reg.id,
        name: reg.contact_name,
        email: reg.contact_email,
        phone: reg.contact_phone,
      },
    });

    await query(
      `UPDATE registrations
          SET razorpay_order_id = $1,
              payment_status = 'pending',
              updated_at = now()
        WHERE id = $2`,
      [order.orderId, registrationId],
    );

    res.json({
      keyId: process.env.RAZORPAY_KEY_ID,

      orderId: order.orderId,

      amount: order.amount,

      currency: order.currency,

      isMock: false,

      customer: {
        name: reg.contact_name,
        email: reg.contact_email,
        contact: reg.contact_phone,
      },
    });
  } catch (err) {
    next(err);
  }
}

const verifySchema = z.object({
  razorpay_payment_id: z.string().min(1),

  razorpay_order_id: z.string().min(1),

  razorpay_signature: z.string().min(1),
});

export async function verifyPayment(req, res, next) {
  try {
    const parsed = verifySchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error:
          "razorpay_payment_id, razorpay_order_id and razorpay_signature are required.",
      });
    }

    const {
      razorpay_payment_id: paymentId,
      razorpay_order_id: orderId,
      razorpay_signature: signature,
    } = parsed.data;

    /*
     * IMPORTANT:
     * We search our own database using the Razorpay order ID.
     *
     * This prevents someone from sending a random order ID
     * belonging to another registration.
     */
    const { rows } = await query(
      `SELECT id,
              contact_name,
              contact_email,
              phantasm_id,
              total_amount,
              is_pass,
              payment_status,
              confirmation_email_sent_at
         FROM registrations
        WHERE razorpay_order_id = $1`,
      [orderId],
    );

    const reg = rows[0];

    if (!reg) {
      return res.status(404).json({
        error: "Razorpay order not found.",
      });
    }

    if (reg.payment_status === "paid") {
      return res.json({
        orderId,
        paymentId,
        paymentStatus: "PAID",
      });
    }

    /*
     * Step 1:
     * Verify Razorpay signature.
     */
    const validSignature = verifyRazorpaySignature({
      orderId,
      paymentId,
      signature,
    });

    if (!validSignature) {
      await query(
        `UPDATE registrations
            SET payment_status = 'failed',
                updated_at = now()
          WHERE id = $1`,
        [reg.id],
      );

      return res.status(400).json({
        error: "Invalid Razorpay payment signature.",
      });
    }

    /*
     * Step 2:
     * Ask Razorpay directly for the payment.
     */
    const payment = await fetchPayment(paymentId);

    /*
     * Make sure this payment actually belongs
     * to the order stored for this registration.
     */
    if (payment.order_id !== orderId) {
      return res.status(400).json({
        error: "Payment does not belong to this order.",
      });
    }

    /*
     * Step 3:
     * Verify amount and currency.
     */
    const expectedAmount =
      Math.round(Number(reg.total_amount) * 100);

    if (
      Number(payment.amount) !== expectedAmount ||
      payment.currency !== "INR"
    ) {
      return res.status(400).json({
        error:
          "Payment amount or currency does not match the registration.",
      });
    }

    /*
     * Step 4:
     * Only captured payments are treated as successful.
     */
    if (payment.status === "captured") {
      await withTransaction(async (client) => {
        await client.query(
          `UPDATE registrations
              SET payment_status = 'paid',
                  updated_at = now()
            WHERE id = $1`,
          [reg.id],
        );
      });

      /*
       * Send confirmation email only once.
       */
      if (!reg.confirmation_email_sent_at) {
        const entries = await query(
          `SELECT event_name,
                  team_name,
                  amount
             FROM event_entries
            WHERE registration_id = $1`,
          [reg.id],
        );

        try {
          await sendRegistrationConfirmationEmail({
            to: reg.contact_email,

            contactName: reg.contact_name,

            phantasmId: reg.phantasm_id,

            registrationId: reg.id,

            totalAmount: reg.total_amount,

            isPass: reg.is_pass,

            events: entries.rows.map((e) => ({
              eventName: e.event_name,
              teamName: e.team_name,
              amount: e.amount,
            })),
          });

          await query(
            `UPDATE registrations
                SET confirmation_email_sent_at = now()
              WHERE id = $1`,
            [reg.id],
          );
        } catch (mailErr) {
          /*
           * Payment has already succeeded.
           * Do not tell the customer that payment failed
           * just because the email failed.
           */
          console.error(
            "Failed to send confirmation email:",
            mailErr,
          );
        }
      }

      return res.json({
        orderId,
        paymentId,
        paymentStatus: "PAID",
      });
    }

    /*
     * Failed/refunded payment.
     */
    if (
      payment.status === "failed" ||
      payment.status === "refunded"
    ) {
      await query(
        `UPDATE registrations
            SET payment_status = 'failed',
                updated_at = now()
          WHERE id = $1`,
        [reg.id],
      );

      return res.json({
        orderId,
        paymentId,
        paymentStatus: "FAILED",
      });
    }

    /*
     * Payment is neither captured nor failed yet.
     */
    return res.json({
      orderId,
      paymentId,
      paymentStatus: "PENDING",
    });
  } catch (err) {
    next(err);
  }
}