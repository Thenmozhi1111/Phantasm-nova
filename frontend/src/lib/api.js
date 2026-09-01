const API_BASE = import.meta.env.VITE_API_URL || 'https://phantasm-nova.onrender.com';

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // no JSON body
  }

  if (!res.ok) {
    throw new Error(data?.message || 'Something went wrong. Please try again.');
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
