import { API_URL } from '../config.js';

export async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, { credentials: 'include', ...options });
  if (!res.ok) {
    const error = new Error(res.statusText);
    error.status = res.status;
    throw error;
  }
  return res.status === 204 ? null : res.json();
}