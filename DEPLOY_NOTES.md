# Deploy notes (read before pushing to Vercel)

## What was fixed in this pass

1. **Admin routes were never mounted** — `routes/admin.js` existed but wasn't
   imported in `app.js`. Fixed: mounted at `app.use('/api', adminRoutes)`.
2. **`requireAdmin` didn't exist** — `routes/admin.js` imported it from
   `middleware/auth.js`, which only exported `requireAuth`. This would have
   thrown at startup the moment admin routes were mounted. Added it.
3. **`express-session` was used but never installed/configured** —
   `adminController.js` calls `req.session.adminId = ...` with no session
   middleware registered anywhere, and the package wasn't even a dependency.
   Added `express-session` + `connect-pg-simple` (backed by the `session`
   table that already existed in `db/schema.sql`, unused until now), and
   wired it into `app.js`.
4. **Cookies were `sameSite: 'lax'`** — this is silently dropped on
   cross-site `fetch()`/XHR calls (only sent on top-level navigations). Since
   your frontend and backend will live on two different Vercel domains, this
   is switched to `sameSite: 'none'` in production (with `secure: true`,
   satisfied by Vercel's HTTPS) in both the auth cookie (`authController.js`)
   and the new session cookie (`app.js`).
5. **Backend had no Vercel entry point** — it was an always-on Express
   server (`app.listen`) built for Render (`render.yaml`). Added
   `backend/api/index.js` (re-exports the Express app for Vercel's
   serverless runtime) and `backend/vercel.json` (routes every path to that
   one function so Express's own router handles `/api/auth`, `/api/admin`,
   etc.).

## How to deploy (two separate Vercel projects)

### Backend
1. Import the repo into Vercel, set **Root Directory = `backend`**.
2. Framework preset: "Other". Build/install commands: leave default
   (`npm install`); no build step is needed.
3. Set these Environment Variables in the Vercel project settings
   (do **not** commit real values — `.env` is gitignored on purpose):
   - `DATABASE_URL` — use Supabase's **pooler** connection string
     (port `6543`, pgbouncer), not the direct `5432` one from your local
     `.env`. Serverless functions open many short-lived connections, and the
     direct port has a low connection limit that pooled functions exhaust.
   - `PGSSL=true`
   - `NODE_ENV=production`
   - `JWT_SECRET`, `SESSION_SECRET` — generate long random strings
   - `CORS_ORIGIN` — your deployed **frontend** URL (e.g.
     `https://your-app.vercel.app`). Leaving this as `localhost` blocks every
     real request with a CORS error.
   - `FRONTEND_URL` — same frontend URL, used in email links
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
   - `CASHFREE_APP_ID`, `CASHFREE_SECRET_KEY`, `CASHFREE_ENV`
4. Deploy. Note the resulting URL, e.g. `https://your-backend.vercel.app`.

### Frontend
1. Import the same repo as a **second** Vercel project, Root Directory =
   `frontend`. It auto-detects Vite.
2. Set Environment Variables:
   - `VITE_API_URL=https://your-backend.vercel.app` — if you skip this, the
     app silently falls back to a hardcoded old Render URL in
     `src/lib/api.js` and every API call will fail.
   - `VITE_CASHFREE_ENV=sandbox` (or `production`)
3. Deploy.
4. Go back to the **backend** project and update `CORS_ORIGIN` /
   `FRONTEND_URL` to this real frontend URL if you didn't already know it.

## Not used on Vercel (safe to ignore)
`render.yaml` and `docker-compose.yml` are leftovers from other
hosting/local-dev setups and aren't read by Vercel at all.
