import { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

const handleSubmit = async (e) => {
  e.preventDefault();

  setError("");
  setSuccessMessage("");

  try {
    setLoading(true);

    const response = await requestPasswordReset(email);

    setSuccessMessage(response.message);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <main className="auth-shell flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
      <div className="grid-overlay" />
      <div className="circuit-overlay" />
      <div className="scanline" />

      <section className="glass-card relative w-full max-w-md overflow-hidden rounded-2xl p-8 sm:p-10">
        {!successMessage ? (
          <>
            <div className="py-6 text-center">
  <div className="mb-4 text-5xl">✉️</div>

  <h1 className="text-2xl font-bold text-white">
    Password Sent
  </h1>

  <p className="mt-4 leading-7 text-slate-300">
    {successMessage}
  </p>

  <p className="mt-4 text-sm text-slate-400">
    Please check your inbox and use the new password to log in.
  </p>
</div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="field rounded-xl border border-slate-700 bg-slate-950/40 p-1">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-transparent px-4 py-3 text-white outline-none placeholder:text-slate-500"
                />
              </div>

              {error && (
                <p className="text-center text-xs font-medium text-red-400">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="primary-glow w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-60"
              >
                {loading ? "Sending…" : "Send Reset Link"}
              </button>
            </form>
          </>
        ) : (
          <div className="py-6 text-center">
            <div className="mb-4 text-5xl">✉️</div>

            <h1 className="text-2xl font-bold text-white">
              Check Your Email
            </h1>

            <p className="mt-4 leading-7 text-slate-300">
              If an account exists with <br />
              <span className="font-medium text-blue-300">{email}</span>,
              you'll receive instructions to reset your password.
            </p>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="link-glow text-sm font-medium text-blue-400"
          >
            ← Back to Login
          </Link>
        </div>
      </section>
    </main>
  );
}