import { memo, useCallback, useMemo, useState } from "react";
import { EVENT_PAIRS, EVENTS, getEvent, partnerOf, PASS_PRICE } from "../lib/events.js";
import { apiFetch } from "../lib/api.js";


function inr(n) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function blankParticipant(){
  return { name: "", email: "", phone: "" };
}

function normalizeEmail(v) {
  return v.trim().toLowerCase();
}

function contactAsParticipant(contact){
  return {
    name: contact.contactName,
    email: contact.contactEmail,
    phone: contact.contactPhone,
  };
}

function initialRoster(ev, contact){
  const rows = Array.from({ length: ev.minSize }, blankParticipant);
  rows[0] = contactAsParticipant(contact);
  return rows;
}

const inputCls =
  "w-full rounded-lg border border-sky-400/20 bg-slate-950/60 px-3 py-2.5 text-sm text-sky-50 placeholder:text-slate-500 outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-400/30 focus:shadow-[0_0_20px_rgba(56,189,248,0.25)]";

export default function RegistrationForm() {
  const [mode, setMode] = useState("single");

  const [contact, setContact] = useState({
    collegeName: "",
    department: "",
    year: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  });

  const [selected, setSelected] = useState({});
  const [teamNames, setTeamNames] = useState({});
  const [teamMeta, setTeamMeta] = useState({});
  const [teamMembers, setTeamMembers] = useState({});
  // Index of the member who already used "Use my details" for each team event.
  const [filledFromContact, setFilledFromContact] = useState({});
  const [needsAccommodation, setNeedsAccommodation] = useState("");
  const [paymentStep, setPaymentStep] = useState("form");
  const [paymentSession, setPaymentSession] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassWarn, setShowPassWarn] = useState(false);

  const selectedEvents = useMemo(
    () => EVENTS.filter((e) => selected[e.id]),
    [selected],
  );
  const techCount = useMemo(
    () => selectedEvents.filter((e) => e.category === "technical").length,
    [selectedEvents],
  );
  const nonTechCount = useMemo(
    () => selectedEvents.filter((e) => e.category === "nontech").length,
    [selectedEvents],
  );
  const isPass = mode === "pass";
  const hasTeamEvents = useMemo(
    () => selectedEvents.some((e) => e.type === "team"),
    [selectedEvents],
  );

  const canSelect = useCallback(
    (ev) => {
      if (!selected[ev.id] && isPass) {
        if (ev.category === "technical" && techCount >= 2) return false;
        if (ev.category === "nontech" && nonTechCount >= 2) return false;
      }
      const partner = partnerOf(ev.id);
      if (partner && selected[partner]) return false;
      return true;
    },
    [selected, isPass, techCount, nonTechCount],
  );

  const total = useMemo(
    () =>
      isPass
        ? PASS_PRICE
        : selectedEvents.reduce((sum, event) => sum + event.price, 0),
    [isPass, selectedEvents],
  );

  function resetSelections() {
    setSelected({});
    setTeamNames({});
    setTeamMeta({});
    setTeamMembers({});
    setFilledFromContact({});
    setNeedsAccommodation("");
    setPaymentStep("form");
    setPaymentSession(null);
  }

  const toggleEvent = useCallback((ev) => {
    if (selected[ev.id]) {
      setSelected((p) => ({ ...p, [ev.id]: false }));
      setTeamNames((p) => {
        const n = { ...p };
        delete n[ev.id];
        return n;
      });
      setTeamMeta((p) => {
        const n = { ...p };
        delete n[ev.id];
        return n;
      });
      setTeamMembers((p) => {
        const n = { ...p };
        delete n[ev.id];
        return n;
      });
      setFilledFromContact((p) => {
        const n = { ...p };
        delete n[ev.id];
        return n;
      });
    } else {
      if (!canSelect(ev)) return;
      setSelected((p) => ({ ...p, [ev.id]: true }));
      if (ev.type === "team") {
        setTeamMembers((p) => ({
          ...p,
          [ev.id]: initialRoster(ev, contact),
        }));
        // First slot is pre-filled from contact details.
        setFilledFromContact((p) => ({ ...p, [ev.id]: 0 }));
      }
    }
  }, [selected, canSelect, contact]);

  function setTeamName(ev, name) {
    setTeamNames((p) => ({ ...p, [ev.id]: name }));
    setTeamMeta((p) => ({ ...p, [ev.id]: { status: "idle", members: [] } }));
  }

  async function lookupTeam(ev) {
    const name = (teamNames[ev.id] ?? "").trim();
    if (!name) return;
    setTeamMeta((p) => ({
      ...p,
      [ev.id]: { status: "loading", members: [] },
    }));
    try {
      const res = await apiFetch(
        `/api/team?name=${encodeURIComponent(name)}&eventId=${ev.id}`,
      );
      const data = await res.json();
      if (data.found) {
        const members = (data.participants ?? []).map(
          (p) => ({ ...p }),
        );
        setTeamMeta((p) => ({
          ...p,
          [ev.id]: {
            status: members.length >= ev.maxSize ? "full" : "found",
            members,
          },
        }));
        setTeamMembers((p) => ({
          ...p,
          [ev.id]: members.length > 0 ? members : initialRoster(ev, contact),
        }));
      } else {
        setTeamMeta((p) => ({
          ...p,
          [ev.id]: { status: "new", members: [] },
        }));
        setTeamMembers((p) => ({
          ...p,
          [ev.id]: p[ev.id]?.length ? p[ev.id] : initialRoster(ev, contact),
        }));
      }
    } catch {
      setTeamMeta((p) => ({
        ...p,
        [ev.id]: { status: "new", members: [] },
      }));
    }
  }

  function updateTeamMember(
    ev,
    index,
    field,
    value,
  ) {
    setTeamMembers((prev) => {
      const rows = prev[ev.id] ? [...prev[ev.id]] : initialRoster(ev, contact);
      rows[index] = { ...rows[index], [field]: value };
      return { ...prev, [ev.id]: rows };
    });
  }

  function fillMemberFromContact(ev, index) {
    // Only one member per team may use the contact details shortcut.
    if (
      filledFromContact[ev.id] !== undefined &&
      filledFromContact[ev.id] !== null &&
      filledFromContact[ev.id] !== index
    ) {
      return;
    }
    setTeamMembers((prev) => {
      const rows = prev[ev.id] ? [...prev[ev.id]] : initialRoster(ev, contact);
      rows[index] = contactAsParticipant(contact);
      return { ...prev, [ev.id]: rows };
    });
    setFilledFromContact((prev) => ({ ...prev, [ev.id]: index }));
  }

  function addMember(ev) {
    setTeamMembers((prev) => {
      const rows = prev[ev.id] ? [...prev[ev.id]] : initialRoster(ev, contact);
      if (rows.length >= ev.maxSize) return prev;
      return { ...prev, [ev.id]: [...rows, blankParticipant()] };
    });
  }

  function removeMember(ev, index) {
    setTeamMembers((prev) => {
      const rows = prev[ev.id] ? [...prev[ev.id]] : initialRoster(ev, contact);
      if (rows.length <= ev.minSize) return prev;
      return { ...prev, [ev.id]: rows.filter((_, i) => i !== index) };
    });
    setFilledFromContact((prev) => {
      const used = prev[ev.id];
      if (used === null || used === undefined) return prev;
      if (used === index) return { ...prev, [ev.id]: null };
      if (used > index) return { ...prev, [ev.id]: used - 1 };
      return prev;
    });
  }

  function validateTeamRoster(ev){
    const rows = teamMembers[ev.id] ?? [];
    if (rows.length < ev.minSize || rows.length > ev.maxSize) {
      return `${ev.name}: enter ${ev.minSize}–${ev.maxSize} team members.`;
    }
    const seen = new Set();
    for (let i = 0; i < rows.length; i++) {
      const p = rows[i];
      if (!p.name.trim() || !p.email.trim() || !p.phone.trim()) {
        return `${ev.name}: fill name, email and phone for participant ${i + 1}.`;
      }
      const email = normalizeEmail(p.email);
      if (seen.has(email)) {
        return `${ev.name}: duplicate email found in team members.`;
      }
      seen.add(email);
    }
    if (!seen.has(normalizeEmail(contact.contactEmail))) {
      return `${ev.name}: include your own email in the team member list so your payment is linked to your ID.`;
    }
    return null;
  }

  function handlePay() {
    setError(null);
    if (!contact.collegeName.trim()) {
      setError("College name is required.");
      return;
    }
    if (
      !contact.contactName.trim() ||
      !contact.contactEmail.trim() ||
      !contact.contactPhone.trim()
    ) {
      setError("Name, email and phone are required.");
      return;
    }
    if (selectedEvents.length === 0) {
      setError("Select at least one event.");
      return;
    }
    if (needsAccommodation !== "yes" && needsAccommodation !== "no") {
      setError("Please choose whether you need accommodation.");
      return;
    }

    for (const ev of selectedEvents.filter((e) => e.type === "team")) {
      if (!(teamNames[ev.id] ?? "").trim()) {
        setError(`${ev.name}: enter a team name.`);
        return;
      }
      const rosterError = validateTeamRoster(ev);
      if (rosterError) {
        setError(rosterError);
        return;
      }
    }

    if (isPass && selectedEvents.length < 4) {
      setShowPassWarn(true);
      return;
    }
    doSubmit();
  }

  async function doSubmit() {
    setShowPassWarn(false);
    setError(null);

    const payload = {
      ...contact,
      pass: isPass,
      needsAccommodation,
      events: selectedEvents.map((ev) => ({
        eventId: ev.id,
        teamName: ev.type === "team" ? teamNames[ev.id] ?? "" : undefined,
        participants: ev.type === "team" ? teamMembers[ev.id] ?? [] : undefined,
      })),
    };

    setSubmitting(true);
    try {
      const res = await apiFetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      // Step 1 done: now init Cashfree order.
      const paymentRes = await apiFetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: data.registrationId,
          returnUrl: `${window.location.origin}/?order_id=${data.cashfreeOrderId}`,
        }),
      });
      const paymentData = await paymentRes.json();
      if (!paymentRes.ok) {
        setError(paymentData.error ?? "Payment init failed.");
        return;
      }
      setPaymentSession({
        registrationId: data.registrationId,
        orderId: paymentData.orderId,
        paymentSessionId: paymentData.paymentSessionId,
        isMock: paymentData.isMock,
        phantasmId: data.phantasmId ?? null,
        totalAmount: data.totalAmount,
      });
      setPaymentStep("gateway");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmPayment() {
    if (!paymentSession) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiFetch(
        `/api/payment/verify?orderId=${encodeURIComponent(paymentSession.orderId)}`,
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Verification failed.");
        return;
      }
      if (data.paymentStatus === "PAID") {
        setSuccess({
          registrationId: paymentSession.registrationId,
          totalAmount: paymentSession.totalAmount,
          phantasmId: paymentSession.phantasmId,
        });
        setPaymentStep("done");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setError(`Payment status: ${data.paymentStatus}. Try again.`);
      }
    } catch {
      setError("Network error while verifying payment.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-sky-400/30 bg-slate-950/70 p-10 text-center shadow-[0_0_60px_rgba(56,189,248,0.25)] backdrop-blur">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-sky-500/20 text-3xl text-sky-300 shadow-[0_0_40px_rgba(56,189,248,0.5)]">
          ✓
        </div>
        <h2 className="mt-6 font-serif text-3xl tracking-widest text-sky-100">
          QUEST CONFIRMED
        </h2>
        <p className="mt-2 text-sm text-sky-300/80">
          {isPass
            ? "Your fest pass is now etched into the ledger."
            : "Your own event payment has been etched into the ledger."}
        </p>
        {success.phantasmId && (
          <div className="mx-auto mt-6 w-fit rounded-2xl border border-dashed border-sky-400/40 bg-slate-950/60 px-8 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-sky-400/70">
              🎫 Your Phantasm ID
            </p>
            <p className="mt-1 font-serif text-2xl tracking-widest text-sky-200 drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]">
              {success.phantasmId}
            </p>
          </div>
        )}
        <div className="mt-6 rounded-xl border border-sky-400/10 bg-slate-950/50 p-4 text-left text-sm text-slate-300">
          <div className="flex justify-between py-1">
            <span>Registration ID</span>
            <span className="font-mono text-xs text-sky-200">
              {success.registrationId}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span>Amount Paid</span>
            <span className="font-semibold text-sky-300">
              {inr(success.totalAmount)}
            </span>
          </div>
        </div>
        <p className="mt-4 text-xs text-slate-500">
          A confirmation email with your event, team and payment details has
          been sent to your registered email address.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-8 rounded-full border border-sky-400/40 bg-sky-500/10 px-6 py-3 font-semibold uppercase tracking-widest text-sky-200 transition hover:bg-sky-500/20 hover:shadow-[0_0_30px_rgba(56,189,248,0.4)]"
        >
          Return to Gate
        </button>
      </div>
    );
  }

  const selectedNames = selectedEvents.map((e) => e.name).join(", ") || "none";

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <div className="mx-auto flex max-w-md gap-3 [perspective:1000px]">
          <button
            type="button"
            onClick={() => {
              setMode("single");
              resetSelections();
            }}
            className={`group flex-1 rounded-xl border px-5 py-4 text-center font-semibold uppercase tracking-[0.2em] transition-all duration-500 [transform-style:preserve-3d] hover:[transform:rotateX(6deg)] ${
              mode === "single"
                ? "border-sky-400/60 bg-gradient-to-b from-sky-500/20 to-sky-950/50 text-sky-100 shadow-[0_0_30px_rgba(56,189,248,0.35)]"
                : "border-sky-400/10 bg-slate-950/50 text-slate-400 hover:border-sky-400/30 hover:text-sky-200"
            }`}
          >
            Single Events
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("pass");
              resetSelections();
            }}
            className={`group flex-1 rounded-xl border px-5 py-4 text-center font-semibold uppercase tracking-[0.2em] transition-all duration-500 [transform-style:preserve-3d] hover:[transform:rotateX(6deg)] ${
              mode === "pass"
                ? "border-sky-400/60 bg-gradient-to-b from-sky-500/20 to-sky-950/50 text-sky-100 shadow-[0_0_30px_rgba(56,189,248,0.35)]"
                : "border-sky-400/10 bg-slate-950/50 text-slate-400 hover:border-sky-400/30 hover:text-sky-200"
            }`}
          >
            Pass
          </button>
        </div>

        <Panel title="Your Details" subtitle="Solo events use this directly. For team events, your email must also appear in the team list so this payment is linked to you.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="College Name" className="sm:col-span-2">
              <input
                className={inputCls}
                placeholder="e.g. St. Xavier's College"
                value={contact.collegeName}
                onChange={(e) => setContact({ ...contact, collegeName: e.target.value })}
              />
            </Field>
            <Field label="Full Name">
              <input
                className={inputCls}
                placeholder="Your name"
                value={contact.contactName}
                onChange={(e) => setContact({ ...contact, contactName: e.target.value })}
              />
            </Field>
            <Field label="Department (optional)">
              <input
                className={inputCls}
                placeholder="e.g. CSE"
                value={contact.department}
                onChange={(e) => setContact({ ...contact, department: e.target.value })}
              />
            </Field>
            <Field label="Year (optional)">
              <input
                className={inputCls}
                placeholder="e.g. III Year"
                value={contact.year}
                onChange={(e) => setContact({ ...contact, year: e.target.value })}
              />
            </Field>
            <Field label="Email">
              <input
                className={inputCls}
                type="email"
                placeholder="you@email.com"
                value={contact.contactEmail}
                onChange={(e) => setContact({ ...contact, contactEmail: e.target.value })}
              />
            </Field>
            <Field label="Phone (10 digits)" className="sm:col-span-2">
              <input
                className={inputCls}
                inputMode="numeric"
                placeholder="9876543210"
                value={contact.contactPhone}
                onChange={(e) => setContact({ ...contact, contactPhone: e.target.value })}
              />
            </Field>
          </div>
        </Panel>

        <Panel
          title={isPass ? "Choose Your Quests" : "Pick Your Quests"}
          subtitle={
            isPass
              ? "The pass remains ₹350 and unlocks up to 2 tech + 2 non-tech events. Events in the same row clash."
              : "Select any number of events within the parallel constraints. Solo events are ₹150 each; team events are ₹250 per registering student."
          }
        >
          {isPass && (
            <div className="mb-4 flex gap-3 text-xs">
              <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-cyan-200">
                Tech {techCount}/2
              </span>
              <span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-violet-200">
                Non-Tech {nonTechCount}/2
              </span>
            </div>
          )}
          <div className="space-y-3 [perspective:1200px]">
            {EVENT_PAIRS.map(([a, b], i) => (
              <div key={i} className="grid gap-3 sm:grid-cols-2">
                <EventCard
                  ev={a}
                  selected={!!selected[a.id]}
                  canSelect={canSelect(a)}
                  onToggle={() => toggleEvent(a)}
                  showCat={isPass}
                  hidePrice={isPass}
                />
                <EventCard
                  ev={b}
                  selected={!!selected[b.id]}
                  canSelect={canSelect(b)}
                  onToggle={() => toggleEvent(b)}
                  showCat={isPass}
                  hidePrice={isPass}
                />
              </div>
            ))}
          </div>
        </Panel>

        {hasTeamEvents && (
          <Panel
            title="Team Bonds"
            subtitle="Create a team name and enter all team members once. If the team already exists, look it up and the roster will auto-fill. Payment is charged only for your own registration ID."
          >
            <div className="space-y-6">
              {selectedEvents
                .filter((e) => e.type === "team")
                .map((ev) => (
                  <TeamSection
                    key={ev.id}
                    ev={ev}
                    teamName={teamNames[ev.id] ?? ""}
                    setTeamName={(n) => setTeamName(ev, n)}
                    onLookup={() => lookupTeam(ev)}
                    meta={teamMeta[ev.id] ?? { status: "idle", members: [] }}
                    participants={teamMembers[ev.id] ?? initialRoster(ev, contact)}
                    onUpdate={(index, field, value) =>
                      updateTeamMember(ev, index, field, value)
                    }
                    onFill={(index) => fillMemberFromContact(ev, index)}
                    onAdd={() => addMember(ev)}
                    onRemove={(index) => removeMember(ev, index)}
                    isPass={isPass}
                    filledIndex={filledFromContact[ev.id] ?? null}
                  />
                ))}
            </div>
          </Panel>
        )}
      </div>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="relative rounded-2xl border border-sky-400/20 bg-slate-950/70 p-6 shadow-[0_0_40px_rgba(56,189,248,0.15)] backdrop-blur">
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-sky-500/5 to-transparent" />
          <h2 className="relative font-serif text-xl tracking-widest text-sky-100 uppercase">
            {isPass ? "Pass Toll" : "Your Toll"}
          </h2>
          <div className="relative mt-4 space-y-2 text-sm">
            {selectedEvents.length === 0 && (
              <p className="text-slate-500 italic">No quests chosen yet.</p>
            )}
            {selectedEvents.map((e) => (
              <div key={e.id} className="flex justify-between gap-3 text-sky-100/80">
                <span>
                  <span className="mr-1">{e.emoji}</span>
                  {e.name}
                  {e.type === "team" && (
                    <span className="ml-1 text-[10px] text-amber-300/70">(team)</span>
                  )}
                </span>
                {isPass ? (
                  <span className="text-[11px] text-slate-500">included</span>
                ) : (
                  <span className="text-sky-300">{inr(e.price)}</span>
                )}
              </div>
            ))}
            {isPass && (
              <div className="flex justify-between border-t border-sky-400/10 pt-2 font-medium text-sky-200">
                <span>Fest Pass</span>
                <span>{inr(PASS_PRICE)}</span>
              </div>
            )}
          </div>

          <div className="relative mt-5 rounded-xl border border-sky-400/15 bg-slate-950/50 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-sky-400/80">
              Do you need accommodation?
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
              {isPass
                ? "Claim a resting chamber for the night of the fest."
                : "Stay arrangements for the night of the fest."}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setNeedsAccommodation("yes")}
                className={`rounded-lg border px-3 py-2.5 text-xs font-semibold uppercase tracking-widest transition ${
                  needsAccommodation === "yes"
                    ? "border-sky-400/60 bg-sky-500/20 text-sky-100 shadow-[0_0_20px_rgba(56,189,248,0.25)]"
                    : "border-sky-400/15 bg-black/20 text-slate-400 hover:border-sky-400/40 hover:text-sky-200"
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setNeedsAccommodation("no")}
                className={`rounded-lg border px-3 py-2.5 text-xs font-semibold uppercase tracking-widest transition ${
                  needsAccommodation === "no"
                    ? "border-sky-400/60 bg-sky-500/20 text-sky-100 shadow-[0_0_20px_rgba(56,189,248,0.25)]"
                    : "border-sky-400/15 bg-black/20 text-slate-400 hover:border-sky-400/40 hover:text-sky-200"
                }`}
              >
                No
              </button>
            </div>
          </div>

          <div className="relative mt-4 flex items-center justify-between border-t border-sky-400/10 pt-4">
            <span className="text-xs uppercase tracking-widest text-slate-400">
              Total
            </span>
            <span className="font-serif text-3xl text-sky-200 drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]">
              {inr(total)}
            </span>
          </div>
          {!isPass && hasTeamEvents && (
            <p className="relative mt-2 text-[10px] leading-relaxed text-amber-300/70">
              Team event payment is per student: only your own registration ID is charged.
            </p>
          )}

          {error && (
            <p className="relative mt-4 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          )}

          <button
            onClick={handlePay}
            disabled={submitting || selectedEvents.length === 0}
            className="relative mt-5 w-full rounded-full border border-sky-400/50 bg-gradient-to-b from-sky-500/30 to-sky-950/60 px-6 py-3.5 font-semibold uppercase tracking-[0.2em] text-sky-100 shadow-[0_0_30px_rgba(56,189,248,0.35)] transition hover:from-sky-400/40 hover:shadow-[0_0_50px_rgba(56,189,248,0.55)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "Opening payment…" : `Pay ${inr(total)}`}
          </button>
          <p className="relative mt-3 text-center text-[10px] uppercase tracking-widest text-slate-600">
            Secure checkout · Confirmation emailed instantly
          </p>
        </div>
      </aside>

      {paymentStep === "gateway" && paymentSession && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-sky-400/40 bg-slate-950/95 p-8 shadow-[0_0_60px_rgba(56,189,248,0.35)]">
            <h3 className="text-center font-serif text-2xl uppercase tracking-widest text-sky-100">
              Cashfree Payment
            </h3>
            <p className="mt-3 text-center text-sm text-slate-300">
              Order ID: <span className="font-mono text-xs text-sky-200">{paymentSession.orderId}</span>
            </p>
            {paymentSession.isMock ? (
              <p className="mt-4 rounded-lg border border-amber-400/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                No Cashfree keys configured. Running in mock mode — confirm to simulate a successful payment.
              </p>
            ) : (
              <p className="mt-4 rounded-lg border border-sky-400/20 bg-sky-500/5 p-3 text-xs text-sky-200">
                In production the Cashfree checkout opens in a popup. Here you can simulate confirmation to continue.
              </p>
            )}
            {error && (
              <p className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {error}
              </p>
            )}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setPaymentStep("form")}
                className="flex-1 rounded-full border border-slate-400/30 px-4 py-3 text-sm font-medium uppercase tracking-widest text-slate-300 transition hover:border-slate-400/60 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={confirmPayment}
                disabled={submitting}
                className="flex-1 rounded-full border border-sky-400/50 bg-sky-500/20 px-4 py-3 text-sm font-semibold uppercase tracking-widest text-sky-100 transition hover:bg-sky-500/30 hover:shadow-[0_0_30px_rgba(56,189,248,0.4)]"
              >
                {submitting ? "Verifying…" : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPassWarn && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 backdrop-blur-sm">
          <div className="mx-4 max-w-md rounded-2xl border border-amber-400/40 bg-slate-950/95 p-8 shadow-[0_0_60px_rgba(251,191,36,0.25)]">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-amber-400/50 bg-amber-500/20 text-2xl text-amber-300 shadow-[0_0_30px_rgba(251,191,36,0.4)]">
              ⚠
            </div>
            <h3 className="mt-4 text-center font-serif text-2xl uppercase tracking-widest text-amber-100">
              Pass Warning
            </h3>
            <p className="mt-3 text-center text-sm leading-relaxed text-slate-300">
              You&apos;re about to seal the{" "}
              <span className="font-semibold text-sky-300">{inr(PASS_PRICE)} Pass</span>{" "}
              with only {selectedEvents.length} quest
              {selectedEvents.length === 1 ? "" : "s"}: <em>{selectedNames}</em>.
              The pass grants entry to up to{" "}
              <strong className="text-sky-200">2 tech + 2 non-tech</strong> events.
            </p>
            <p className="mt-2 text-center text-xs text-slate-500">
              Return to the gate and claim your full share, or press on.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowPassWarn(false)}
                className="flex-1 rounded-full border border-slate-400/30 px-4 py-3 text-sm font-medium uppercase tracking-widest text-slate-300 transition hover:border-slate-400/60 hover:text-white"
              >
                Go Back
              </button>
              <button
                onClick={doSubmit}
                className="flex-1 rounded-full border border-sky-400/50 bg-sky-500/20 px-4 py-3 text-sm font-semibold uppercase tracking-widest text-sky-100 transition hover:bg-sky-500/30 hover:shadow-[0_0_30px_rgba(56,189,248,0.4)]"
              >
                Press On
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <section className="relative rounded-2xl border border-sky-400/15 bg-slate-950/60 p-6 shadow-[0_0_40px_rgba(56,189,248,0.08)] backdrop-blur">
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-sky-500/[0.03] to-transparent" />
      <div className="relative">
        <h2 className="font-serif text-xl uppercase tracking-[0.25em] text-sky-100">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            {subtitle}
          </p>
        )}
        <div className="mt-5">{children}</div>
      </div>
    </section>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-400/70">
        {label}
      </span>
      {children}
    </label>
  );
}

const EventCard = memo(function EventCard({
  ev,
  selected,
  canSelect,
  onToggle,
  showCat,
  hidePrice,
}) {
  const locked = !selected && !canSelect;
  const partner = partnerOf(ev.id);
  const partnerEv = partner ? getEvent(partner) : null;

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={locked}
      className={`group relative overflow-hidden rounded-xl border p-5 text-left transition-all duration-200 contain-paint ${
        selected
          ? "border-sky-400/70 bg-gradient-to-b from-sky-500/15 to-sky-950/40 shadow-[0_0_24px_rgba(56,189,248,0.28)]"
          : locked
            ? "cursor-not-allowed border-slate-700/30 bg-slate-950/30 opacity-30"
            : "border-sky-400/15 bg-slate-950/50 hover:border-sky-400/40 hover:shadow-[0_0_18px_rgba(56,189,248,0.16)] hover:-translate-y-0.5"
      }`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-sky-400/10 to-transparent transition-opacity ${
          selected ? "opacity-100" : "opacity-30 group-hover:opacity-70"
        }`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-sky-400/60 to-transparent transition-opacity ${
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-60"
        }`}
      />

      <div className="relative flex items-start justify-between gap-2">
        <span className="text-3xl drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]">
          {ev.emoji}
        </span>
        <div className="flex flex-col items-end gap-1">
          {ev.type === "team" ? (
            <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-amber-300">
              {ev.minSize === ev.maxSize
                ? `Team ${ev.maxSize}`
                : `Team ${ev.minSize}–${ev.maxSize}`}
            </span>
          ) : (
            <span className="rounded-full border border-sky-400/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-sky-300">
              Solo
            </span>
          )}
          {showCat && (
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${
                ev.category === "technical"
                  ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-300"
                  : "border-violet-400/30 bg-violet-500/10 text-violet-300"
              }`}
            >
              {ev.category === "technical" ? "Tech" : "Non-Tech"}
            </span>
          )}
        </div>
      </div>
      <h3 className="relative mt-3 font-serif text-lg tracking-wider text-sky-50">
        {ev.name}
      </h3>
      <p className="relative mt-1 text-xs leading-relaxed text-slate-400">
        {ev.description}
      </p>
      {!hidePrice && (
        <div className="relative mt-3 flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-widest text-slate-500">
            {ev.type === "team" ? "Your Seat Fee" : "Entry Fee"}
          </span>
          <span className="font-serif text-lg text-sky-200 drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]">
            {inr(ev.price)}
          </span>
        </div>
      )}
      {hidePrice && (
        <div className="relative mt-3 flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-widest text-slate-500">
            Pass Included
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-emerald-300/80">
            Included
          </span>
        </div>
      )}
      {locked && partnerEv && (
        <p className="relative mt-2 text-[10px] uppercase tracking-widest text-red-300/70">
          Clashes with {partnerEv.name}
        </p>
      )}
    </button>
  );
});

const TeamSection = memo(function TeamSection({
  ev,
  teamName,
  setTeamName,
  onLookup,
  meta,
  participants,
  onUpdate,
  onFill,
  onAdd,
  onRemove,
  isPass,
  filledIndex,
}) {
  return (
    <div className="relative rounded-xl border border-sky-400/15 bg-slate-950/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl drop-shadow-[0_0_10px_rgba(56,189,248,0.4)]">
            {ev.emoji}
          </span>
          <h3 className="font-serif text-base tracking-wider text-sky-100">
            {ev.name}
            <span className="ml-2 text-xs font-normal uppercase tracking-widest text-slate-500">
              {ev.minSize === ev.maxSize
                ? `team of ${ev.maxSize}`
                : `team of ${ev.minSize}–${ev.maxSize}`}
            </span>
          </h3>
        </div>
        {!isPass && (
          <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-amber-300">
            You pay {inr(ev.price)} only
          </span>
        )}
        {isPass && (
          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-emerald-300">
            Pass Included
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          className={inputCls}
          placeholder="Team name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onLookup();
            }
          }}
        />
        <button
          type="button"
          onClick={onLookup}
          className="shrink-0 rounded-lg border border-sky-400/30 bg-sky-500/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-sky-200 transition hover:border-sky-400/60 hover:bg-sky-500/20 hover:shadow-[0_0_20px_rgba(56,189,248,0.3)]"
        >
          {meta.status === "loading" ? "Seeking…" : "Look up"}
        </button>
      </div>

      {meta.status === "found" && (
        <p className="mt-3 text-xs font-medium text-emerald-300">
          ✓ Team found — roster loaded from the database. No need to retype it.
        </p>
      )}
      {meta.status === "new" && (
        <p className="mt-3 text-xs font-medium text-sky-300">
          ⚡ New team — fill all team members once. Other members can later look up this team and pay from their own ID.
        </p>
      )}
      {meta.status === "full" && (
        <p className="mt-3 text-xs font-medium text-amber-300">
          Team roster is full ({participants.length}/{ev.maxSize}). Members already listed can still pay separately from their own ID.
        </p>
      )}

      <div className="mt-4 space-y-3">
        {participants.map((p, i) => (
          <div
            key={i}
            className="rounded-lg border border-sky-400/10 bg-slate-950/60 p-3"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-sky-400/70">
                Member {i + 1}
                {filledIndex === i && (
                  <span className="ml-2 text-emerald-400/80">· you</span>
                )}
              </span>
              <div className="flex gap-2">
                {(filledIndex === null || filledIndex === i) && (
                  <button
                    type="button"
                    onClick={() => onFill(i)}
                    className="rounded-full border border-sky-400/20 px-2 py-1 text-[10px] uppercase tracking-widest text-sky-300 transition hover:border-sky-400/50"
                  >
                    {filledIndex === i ? "Your details" : "Use my details"}
                  </button>
                )}
                {participants.length > ev.minSize && (
                  <button
                    type="button"
                    onClick={() => onRemove(i)}
                    className="rounded-full border border-red-400/20 px-2 py-1 text-[10px] uppercase tracking-widest text-red-300 transition hover:border-red-400/50"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <input
                className={inputCls}
                placeholder="Name"
                value={p.name}
                onChange={(e) => onUpdate(i, "name", e.target.value)}
              />
              <input
                className={inputCls}
                type="email"
                placeholder="Email"
                value={p.email}
                onChange={(e) => onUpdate(i, "email", e.target.value)}
              />
              <input
                className={inputCls}
                inputMode="numeric"
                placeholder="Phone"
                value={p.phone}
                onChange={(e) => onUpdate(i, "phone", e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[10px] uppercase tracking-widest text-slate-600">
          Roster {participants.length}/{ev.maxSize} · minimum {ev.minSize}
        </p>
        {participants.length < ev.maxSize && (
          <button
            type="button"
            onClick={onAdd}
            className="rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-sky-200 transition hover:bg-sky-500/20"
          >
            + Add member
          </button>
        )}
      </div>
    </div>
  );
});
