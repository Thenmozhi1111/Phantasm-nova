import { z } from "zod";
import { query, withTransaction } from "../db/pool.js";
import { createPaymentOrder, verifyPaymentOrder } from "../services/payment.js";
import { sendRegistrationConfirmationEmail } from "../services/email.js";

const createSchema = z.object({
  registrationId: z.string().uuid(),
  returnUrl: z.string().url(),
});

export async function createPayment(req, res, next) {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "registrationId and returnUrl are required." });
    }
    const { registrationId, returnUrl } = parsed.data;

    const { rows } = await query(
      `SELECT id, contact_name, contact_email, contact_phone, total_amount,
              payment_status, cashfree_order_id
         FROM registrations WHERE id = $1`,
      [registrationId],
    );
    const reg = rows[0];
    if (!reg) return res.status(404).json({ error: "Registration not found." });
    if (reg.payment_status === "paid") {
      return res.status(409).json({ error: "This registration has already been paid for." });
    }

    // Re-use an existing order id if one was already created for this
    // registration (e.g. the user refreshed before completing payment).
    const orderId = reg.cashfree_order_id || `phx_${reg.id.replace(/-/g, "").slice(0, 24)}_${Date.now()}`;

    const order = await createPaymentOrder({
      orderId,
      amount: reg.total_amount,
      customer: {
        id: reg.id,
        name: reg.contact_name,
        email: reg.contact_email,
        phone: reg.contact_phone,
      },
      returnUrl,
    });

    if (!reg.cashfree_order_id) {
      await query(`UPDATE registrations SET cashfree_order_id = $1, updated_at = now() WHERE id = $2`, [
        order.orderId,
        registrationId,
      ]);
    }

    res.json({
      orderId: order.orderId,
      paymentSessionId: order.paymentSessionId,
      isMock: order.isMock,
    });
  } catch (err) {
    next(err);
  }
}

const verifySchema = z.object({ orderId: z.string().min(1) });

export async function verifyPayment(req, res, next) {
  try {
    const parsedQuery = verifySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({ error: "orderId query param is required." });
    }
    const { orderId } = parsedQuery.data;

    const { rows } = await query(
      `SELECT id, contact_name, contact_email, phantasm_id, total_amount, is_pass,
              payment_status, confirmation_email_sent_at
         FROM registrations WHERE cashfree_order_id = $1`,
      [orderId],
    );
    const reg = rows[0];
    if (!reg) return res.status(404).json({ error: "Order not found." });

    if (reg.payment_status === "paid") {
      return res.json({ orderId, paymentStatus: "PAID" });
    }

    const result = await verifyPaymentOrder(orderId);

    if (result.paymentStatus === "PAID") {
      await withTransaction(async (client) => {
        await client.query(
          `UPDATE registrations SET payment_status = 'paid', updated_at = now() WHERE id = $1`,
          [reg.id],
        );
      });

      if (!reg.confirmation_email_sent_at) {
        const entries = await query(
          `SELECT event_name, team_name, amount FROM event_entries WHERE registration_id = $1`,
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
            `UPDATE registrations SET confirmation_email_sent_at = now() WHERE id = $1`,
            [reg.id],
          );
        } catch (mailErr) {
          // Payment already succeeded — don't fail the request just because
          // the confirmation email didn't send. Log and move on.
          console.error("Failed to send confirmation email:", mailErr);
        }
      }
    } else if (result.paymentStatus === "FAILED") {
      await query(
        `UPDATE registrations SET payment_status = 'failed', updated_at = now() WHERE id = $1`,
        [reg.id],
      );
    }

    res.json({ orderId, paymentStatus: result.paymentStatus });
  } catch (err) {
    next(err);
  }
}
