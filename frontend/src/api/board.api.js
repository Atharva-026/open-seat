import { request } from './http.js';

const send = (method, body) => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const fetchSkills = () => request('/api/skills');
export const fetchBoard = () => request('/api/board');
export const postSeat = (teamId, body) => request(`/api/teams/${teamId}/seats`, send('POST', body));
export const closeSeat = (seatId) => request(`/api/seats/${seatId}`, { method: 'DELETE' });
export const requestSeat = (seatId, message) => request(`/api/seats/${seatId}/request`, send('POST', { message }));
export const fetchSeatRequests = () => request('/api/seat-requests');
export const respondToSeatRequest = (id, accept) =>
  request(`/api/seat-requests/${id}/respond`, send('POST', { accept }));