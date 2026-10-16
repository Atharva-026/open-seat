import { EventEmitter } from 'node:events';

// Agents hand work to each other through events; the graph holds the shared state.
export const bus = new EventEmitter();
export const EVENTS = { teamConfirmed: 'team.confirmed' };