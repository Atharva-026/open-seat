import { request } from './http.js';

export const fetchMe = () => request('/api/me');
export const logout = () => request('/auth/logout', { method: 'POST' });