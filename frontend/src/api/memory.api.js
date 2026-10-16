import { request } from './http.js';

export const fetchMemory = () => request('/api/memory');

export const savePreference = (key, value) =>
  request(`/api/memory/preferences/${key}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  });

export const forgetPreference = (key) =>
  request(`/api/memory/preferences/${key}`, { method: 'DELETE' });

export const forgetEverything = () => request('/api/memory', { method: 'DELETE' });