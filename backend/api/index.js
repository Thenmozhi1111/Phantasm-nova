// Vercel serverless entry point.
//
// Vercel doesn't run a long-lived server (src/server.js's app.listen is only
// used for local dev / other hosts like Render). Instead it imports whatever
// this file exports and calls it per-request like a plain (req, res) handler.
// Express apps are directly compatible with that, so we just re-export it.
import app from '../src/app.js';

export default app;
