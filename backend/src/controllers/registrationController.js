import { z } from "zod";
import { withTransaction, query } from "../db/pool.js";
import { EVENTS, PASS_PRICE, getEvent } from "../data/events.js";
import { generatePhantasmId, generateOnspotId } from "../utils/phantasmId.js";

const participantSchema = z.object({
  name: z.string().trim().min(1, "Participant name is required."),
  email: z.string().trim().email("Enter a valid participant email."),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid participant phone number.")
    .max(15),
});

const eventSelectionSchema = z.object({
  eventId: z.string().min(1),
  teamName: z.string().trim().optional(),
  participants: z.array(participantSchema).optional(),
});

export const registrationSchema = z.object({
  collegeName: z.string().trim().min(1, "College name is required."),
  department: z.string().trim().optional().default(""),
  year: z.string().trim().optional().default(""),
  contactName: z.string().trim().min(1, "Contact name is required."),
  contactEmail: z.string().trim().email("Enter a valid contact email."),
  contactPhone: z
    .string()
    .trim()
    .min(7, "Enter a valid contact phone number.")
    .max(15),
  pass: z.boolean(),
  needsAccommodation: z.enum(["yes", "no"], {
    errorMap: () => ({ message: "Please choose whether accommodation is needed." }),
  }),
  events: z.array(eventSelectionSchema).min(1, "Select at least one event."),
});

function normalizeEmail(v) {
  return v.trim().toLowerCase();
}

/** Re-validates and re-prices the submitted events against the server's
 * own event catalog. Never trusts client-sent prices/types/sizes. */
function resolveEvents(payload) {
  const seenEventIds = new Set();
  const resolved = [];

  for (const sel of payload.events) {
    const ev = getEvent(sel.eventId);
    if (!ev) {
      throw badRequest(`Unknown event: ${sel.eventId}`);
    }
    if (seenEventIds.has(ev.id)) {
      throw badRequest(`Duplicate event selection: ${ev.name}`);
    }
    seenEventIds.add(ev.id);

    if (ev.parallelWith && seenEventIds.has(ev.parallelWith)) {
      const clash = getEvent(ev.parallelWith);
      throw badRequest(`${ev.name} clashes with ${clash?.name ?? ev.parallelWith}.`);
    }

    // Team events no longer collect a team name or roster upfront — the
    // registrant pays for their own seat, same as a solo event. Team
    // grouping (if any) is handled later, outside this flow.
    resolved.push({
      ev,
      teamName: null,
      participants: [
        { name: payload.contactName, email: payload.contactEmail, phone: payload.contactPhone },
      ],
    });
  }

  // Pass-mode business rules: at most 2 technical + 2 non-technical events.
  if (payload.pass) {
    const techCount = resolved.filter((r) => r.ev.category === "technical").length;
    const nonTechCount = resolved.filter((r) => r.ev.category === "nontech").length;
    if (techCount > 2 || nonTechCount > 2) {
      throw badRequest("Pass allows at most 2 technical and 2 non-technical events.");
    }
  }

  return resolved;
}

function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

function computeTotal(payload, resolvedEvents) {
  if (payload.pass) return PASS_PRICE;
  return resolvedEvents.reduce((sum, r) => sum + r.ev.price, 0);
}

export async function createRegistration(req, res, next) {
  try {
    const payload = req.body; // already validated by validateBody(registrationSchema)
    const resolvedEvents = resolveEvents(payload);
    const totalAmount = computeTotal(payload, resolvedEvents);
    const phantasmId = generatePhantasmId();

    const registrationId = await withTransaction(async (client) => {
      const regResult = await client.query(
        `INSERT INTO registrations
           (phantasm_id, college_name, department, year, contact_name, contact_email,
            contact_phone, is_pass, needs_accommodation, total_amount, payment_status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'pending')
         RETURNING id`,
        [
          phantasmId,
          payload.collegeName,
          payload.department || null,
          payload.year || null,
          payload.contactName,
          payload.contactEmail,
          payload.contactPhone,
          payload.pass,
          payload.needsAccommodation,
          totalAmount,
        ],
      );
      const regId = regResult.rows[0].id;

      for (const r of resolvedEvents) {
        const entryResult = await client.query(
          `INSERT INTO event_entries
             (registration_id, event_id, event_name, event_type, event_category, team_name, amount)
           VALUES ($1,$2,$3,$4,$5,$6,$7)
           RETURNING id`,
          [
            regId,
            r.ev.id,
            r.ev.name,
            r.ev.type,
            r.ev.category,
            r.teamName,
            payload.pass ? 0 : r.ev.price,
          ],
        );
        const entryId = entryResult.rows[0].id;

        for (const p of r.participants) {
          await client.query(
            `INSERT INTO participants (event_entry_id, name, email, phone)
             VALUES ($1,$2,$3,$4)`,
            [entryId, p.name.trim(), normalizeEmail(p.email), p.phone.trim()],
          );
        }
      }

      return regId;
    });

    res.status(201).json({
      registrationId,
      phantasmId,
      totalAmount,
    });
  } catch (err) {
    next(err);
  }
}

const teamLookupSchema = z.object({
  name: z.string().trim().min(1),
  eventId: z.string().trim().min(1),
});

export async function lookupTeam(req, res, next) {
  try {
    const parsed = teamLookupSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: "name and eventId query params are required." });
    }
    const { name, eventId } = parsed.data;
    const ev = getEvent(eventId);
    if (!ev) return res.status(400).json({ error: "Unknown event." });

    const result = await query(
      `SELECT p.id, p.name, p.email, p.phone
         FROM event_entries ee
         JOIN participants p ON p.event_entry_id = ee.id
         JOIN registrations r ON r.id = ee.registration_id
        WHERE ee.event_id = $1
          AND lower(ee.team_name) = lower($2)
          AND r.payment_status != 'failed'
        ORDER BY p.created_at ASC`,
      [eventId, name],
    );

    if (result.rows.length === 0) {
      return res.json({ found: false, participants: [] });
    }

    res.json({
      found: true,
      participants: result.rows.map((p) => ({ name: p.name, email: p.email, phone: p.phone })),
    });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// Admin "on-spot" registration — used by the admin dashboard to register a
// walk-in participant at the venue. Payment is collected separately (cash /
// UPI at the desk), so this never touches the payment gateway: it inserts
// the registration straight in as `payment_status: 'paid'`. Only reachable
// behind requireAdmin (see routes/admin.js).
// ---------------------------------------------------------------------------
const onspotSchema = z.object({
  name: z.string().trim().min(1, "Participant name is required."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number.")
    .max(15, "Enter a valid phone number."),
  collegeName: z.string().trim().min(1, "College name is required."),
  eventId: z.string().trim().min(1, "Select an event."),
});

export async function createOnspotRegistration(req, res, next) {
  try {
    const parsed = onspotSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request." });
    }
    const payload = parsed.data;

    const ev = getEvent(payload.eventId);
    if (!ev) {
      return res.status(400).json({ error: `Unknown event: ${payload.eventId}` });
    }

    const email = normalizeEmail(payload.email);
    const phantasmId = generateOnspotId();

    const registrationId = await withTransaction(async (client) => {
      const regResult = await client.query(
        `INSERT INTO registrations
           (phantasm_id, college_name, contact_name, contact_email, contact_phone,
            is_pass, needs_accommodation, total_amount, payment_status)
         VALUES ($1,$2,$3,$4,$5,false,'no',$6,'paid')
         RETURNING id`,
        [phantasmId, payload.collegeName, payload.name, email, payload.phone, ev.price],
      );
      const regId = regResult.rows[0].id;

      const entryResult = await client.query(
        `INSERT INTO event_entries
           (registration_id, event_id, event_name, event_type, event_category, team_name, amount)
         VALUES ($1,$2,$3,$4,$5,NULL,$6)
         RETURNING id`,
        [regId, ev.id, ev.name, ev.type, ev.category, ev.price],
      );
      const entryId = entryResult.rows[0].id;

      await client.query(
        `INSERT INTO participants (event_entry_id, name, email, phone)
         VALUES ($1,$2,$3,$4)`,
        [entryId, payload.name.trim(), email, payload.phone.trim()],
      );

      return regId;
    });

    res.status(201).json({
      registrationId,
      phantasmId,
      totalAmount: ev.price,
      paymentStatus: "paid",
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "ID collision generating registration ID, please try again." });
    }
    next(err);
  }
}

export { EVENTS };
