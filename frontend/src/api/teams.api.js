import { request } from './http.js';

const post = (body) => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const fetchTeams = () => request('/api/teams');
export const createTeam = (body) => request('/api/teams', post(body));
export const submitFeedback = (teamId, entries) =>
  request(`/api/teams/${teamId}/feedback`, post({ entries }));
export const fetchInbox = () => request('/api/invites');
export const respondToInvite = (id, accept) => request(`/api/invites/${id}/respond`, post({ accept }));