import { request } from './http.js';

export const askMatcher = (message) =>
  request('/api/agent/matcher', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });