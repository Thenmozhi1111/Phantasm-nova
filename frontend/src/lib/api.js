const API_BASE = import.meta.env.VITE_API_URL || 'https://phantasm-nova.onrender.com';

// Previously a hung request (e.g. the backend's SMTP call blocking on
// "forgot password") had nothing to stop it, so buttons like "Sending…"
// could spin forever with no feedback. This aborts and surfaces a clear
// error after DEFAULT_TIMEOUT_MS instead.
const DEFAULT_TIMEOUT_MS = 20_000;

export async function apiFetch(path, { timeoutMs = DEFAULT_TIMEOUT_MS, ...options } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('The server took too long to respond. Please try again in a moment.');
    }
    throw new Error('Network error. Please check your connection and try again.');
  } finally {
    clearTimeout(timer);
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // no JSON body
  }

  if (!res.ok) {
    throw new Error(data?.message || data?.error || 'Something went wrong. Please try again.');
  }

  return data;
}

async function request(path, options = {}) {
  return apiFetch(path, options);
}

export const registerUser = (payload) =>
  request('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) });

export const loginUser = (payload) =>
  request('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) });

export const logoutUser = () => request('/api/auth/logout', { method: 'POST' });

export const fetchCurrentUser = () => request('/api/auth/me', { method: 'GET' });

export const requestPasswordReset = (email) =>
  request('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });

export const resetPassword = (token, password) =>
  request('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) });
