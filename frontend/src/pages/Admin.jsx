import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api.js";

function inr(n) {
  return `₹${Number(n).toLocaleString("en-IN")}`;
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-sky-400/15 bg-slate-950/50 p-5 shadow-[0_0_30px_rgba(56,189,248,0.08)]">
      <p className="text-[10px] uppercase tracking-[0.3em] text-sky-400/70">{label}</p>
      <p className="mt-2 font-serif text-2xl text-sky-100 drop-shadow-[0_0_10px_rgba(56,189,248,0.4)]">
        {value}
      </p>
    </div>
  );
}

function LoginForm({ onLoggedIn, onForgotPassword }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await apiFetch("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed.");
        return;
      }
      onLoggedIn();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-24">
      <div className="rounded-2xl border border-sky-400/20 bg-slate-950/60 p-8 shadow-[0_0_40px_rgba(56,189,248,0.1)]">
        <h1 className="font-serif text-2xl tracking-[0.25em] uppercase text-sky-100 text-center">
          The Ledger
        </h1>
        <p className="mt-2 text-center text-xs text-slate-400">
          Enter the admin password to continue.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="w-full rounded-lg border border-sky-400/20 bg-slate-950/60 px-3 py-2.5 text-sm text-sky-50 placeholder:text-slate-500 outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-400/30"
          />
          {error && (
            <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full border border-sky-400/50 bg-gradient-to-b from-sky-500/30 to-sky-950/60 px-6 py-3 font-semibold uppercase tracking-[0.2em] text-sky-100 shadow-[0_0_30px_rgba(56,189,248,0.35)] transition hover:from-sky-400/40 disabled:opacity-40"
          >
            {submitting ? "Entering…" : "Enter"}
          </button>
          <button
            type="button"
            onClick={onForgotPassword}
            className="w-full text-center text-[11px] uppercase tracking-[0.2em] text-sky-400/70 transition hover:text-sky-300"
          >
            Forgot password?
          </button>
        </form>
      </div>
    </div>
  );
}

function ForgotPasswordForm({ onBack }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);
    try {
      const res = await apiFetch("/api/admin/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setMessage(
        data.message ??
          "If that email is registered, instructions to change your password have been sent.",
      );
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-24">
      <div className="rounded-2xl border border-sky-400/20 bg-slate-950/60 p-8 shadow-[0_0_40px_rgba(56,189,248,0.1)]">
        <h1 className="font-serif text-2xl tracking-[0.25em] uppercase text-sky-100 text-center">
          Recover Access
        </h1>
        <p className="mt-2 text-center text-xs text-slate-400">
          Enter the admin email. We'll send a link with instructions to set a new password.
        </p>
        {message ? (
          <p className="mt-6 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-3 text-center text-xs text-emerald-300">
            {message}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full rounded-lg border border-sky-400/20 bg-slate-950/60 px-3 py-2.5 text-sm text-sky-50 placeholder:text-slate-500 outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-400/30"
            />
            {error && (
              <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full border border-sky-400/50 bg-gradient-to-b from-sky-500/30 to-sky-950/60 px-6 py-3 font-semibold uppercase tracking-[0.2em] text-sky-100 shadow-[0_0_30px_rgba(56,189,248,0.35)] transition hover:from-sky-400/40 disabled:opacity-40"
            >
              {submitting ? "Sending…" : "Send reset instructions"}
            </button>
          </form>
        )}
        <button
          type="button"
          onClick={onBack}
          className="mt-6 w-full text-center text-[11px] uppercase tracking-[0.2em] text-sky-400/70 transition hover:text-sky-300"
        >
          ← Back to login
        </button>
      </div>
    </div>
  );
}

function ResetPasswordForm({ token, onDone }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch("/api/admin/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not reset password.");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-24">
      <div className="rounded-2xl border border-sky-400/20 bg-slate-950/60 p-8 shadow-[0_0_40px_rgba(56,189,248,0.1)]">
        <h1 className="font-serif text-2xl tracking-[0.25em] uppercase text-sky-100 text-center">
          Set New Password
        </h1>
        {success ? (
          <>
            <p className="mt-6 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-3 text-center text-xs text-emerald-300">
              Your password has been changed. You can now log in with it.
            </p>
            <button
              type="button"
              onClick={onDone}
              className="mt-6 w-full rounded-full border border-sky-400/50 bg-gradient-to-b from-sky-500/30 to-sky-950/60 px-6 py-3 font-semibold uppercase tracking-[0.2em] text-sky-100 shadow-[0_0_30px_rgba(56,189,248,0.35)] transition hover:from-sky-400/40"
            >
              Go to login
            </button>
          </>
        ) : (
          <>
            <p className="mt-2 text-center text-xs text-slate-400">
              Choose a new password for the admin ledger.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                className="w-full rounded-lg border border-sky-400/20 bg-slate-950/60 px-3 py-2.5 text-sm text-sky-50 placeholder:text-slate-500 outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-400/30"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full rounded-lg border border-sky-400/20 bg-slate-950/60 px-3 py-2.5 text-sm text-sky-50 placeholder:text-slate-500 outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-400/30"
              />
              {error && (
                <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full border border-sky-400/50 bg-gradient-to-b from-sky-500/30 to-sky-950/60 px-6 py-3 font-semibold uppercase tracking-[0.2em] text-sky-100 shadow-[0_0_30px_rgba(56,189,248,0.35)] transition hover:from-sky-400/40 disabled:opacity-40"
              >
                {submitting ? "Saving…" : "Save new password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function Dashboard({ onLogout }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch("/api/admin/registrations");
        if (res.status === 401) {
          onLogout();
          return;
        }
        const body = await res.json();
        if (!cancelled) setData(body);
      } catch {
        if (!cancelled) setError("Failed to load the ledger.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [onLogout]);

  async function handleLogout() {
    await apiFetch("/api/admin/logout", { method: "POST" });
    onLogout();
  }

  const regs = data?.registrations ?? [];
  const stats = data?.stats ?? { registrationsCount: 0, eventEntriesCount: 0, revenue: 0 };

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-serif text-2xl tracking-[0.25em] uppercase text-sky-100">
          The Ledger
        </h1>
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="rounded-full border border-sky-400/30 px-4 py-1.5 text-xs uppercase tracking-widest text-sky-300 hover:border-sky-400/60 hover:text-sky-100"
          >
            ← Back to Gate
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-full border border-red-400/30 px-4 py-1.5 text-xs uppercase tracking-widest text-red-300 hover:border-red-400/60 hover:text-red-100"
          >
            Log out
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Registrations" value={String(stats.registrationsCount)} />
        <Stat label="Event Entries" value={String(stats.eventEntriesCount)} />
        <Stat label="Revenue" value={inr(stats.revenue)} />
      </div>

      {error && (
        <p className="mt-6 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      )}

      <div className="mt-8 space-y-4">
        {data && regs.length === 0 && (
          <p className="rounded-2xl border border-sky-400/15 bg-slate-950/50 p-6 text-center text-slate-500">
            The ledger is empty.
          </p>
        )}
        {regs.map((r) => (
          <div
            key={r.id}
            className="rounded-2xl border border-sky-400/15 bg-slate-950/50 p-5 shadow-[0_0_30px_rgba(56,189,248,0.08)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-serif text-lg tracking-wider text-sky-100">
                  {r.college_name}
                </h2>
                <p className="text-xs text-slate-400">
                  {r.contact_name} · {r.contact_email} · {r.contact_phone}
                </p>
                {r.department && (
                  <p className="text-xs text-slate-500 mt-0.5">Dept: {r.department}</p>
                )}
                {r.year && <p className="text-xs text-slate-500">Year: {r.year}</p>}
                {r.phantasm_id && (
                  <p className="text-xs font-mono text-sky-300/90 mt-0.5">{r.phantasm_id}</p>
                )}
              </div>
              <div className="text-right">
                <span className="rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-300">
                  {inr(r.total_amount)} · {r.payment_status === "paid" ? "Paid" : r.payment_status}
                </span>
                <p className="mt-1 text-[10px] uppercase tracking-widest text-slate-500">
                  {r.pass_type === "pass" ? "Pass" : "Single"}
                </p>
                {r.needs_accommodation && (
                  <p className="mt-0.5 text-[10px] text-amber-300/70">
                    Stay: {r.needs_accommodation}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(r.events ?? []).map((e) => (
                <div
                  key={e.id}
                  className="rounded-xl border border-sky-400/10 bg-slate-950/70 p-3"
                >
                  <div className="flex justify-between">
                    <span className="font-medium text-sky-100">{e.event_name}</span>
                    <span className="text-xs text-slate-500">
                      {e.event_type} · {inr(e.amount)}
                    </span>
                  </div>
                  {e.team_name && (
                    <p className="mt-1 text-xs font-semibold text-amber-300">
                      Team: {e.team_name}
                    </p>
                  )}
                  <ul className="mt-2 space-y-1 text-xs text-slate-400">
                    {(e.participants ?? []).map((p) => (
                      <li key={p.id}>
                        {p.name} — {p.email} — {p.phone}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(null); // null = checking
  const [view, setView] = useState("login"); // "login" | "forgot" | "reset"
  const [resetToken, setResetToken] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("reset_token");
    if (token) {
      setResetToken(token);
      setView("reset");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch("/api/admin/session");
        const data = await res.json();
        if (!cancelled) setAuthenticated(Boolean(data.authenticated));
      } catch {
        if (!cancelled) setAuthenticated(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function backToLogin() {
    setView("login");
    setResetToken(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("reset_token");
    window.history.replaceState({}, "", url.pathname + url.search);
  }

  if (view === "reset" && resetToken) {
    return <ResetPasswordForm token={resetToken} onDone={backToLogin} />;
  }

  if (authenticated === null) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <p className="text-xs uppercase tracking-[0.4em] text-sky-400/60">Loading…</p>
      </div>
    );
  }

  if (authenticated) {
    return <Dashboard onLogout={() => setAuthenticated(false)} />;
  }

  if (view === "forgot") {
    return <ForgotPasswordForm onBack={() => setView("login")} />;
  }

  return (
    <LoginForm
      onLoggedIn={() => setAuthenticated(true)}
      onForgotPassword={() => setView("forgot")}
    />
  );
}
