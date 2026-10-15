import { request } from './http.js';

export const fetchSkills = () => request('/api/skills');

export const findMatches = (body) =>
  request('/api/match', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });