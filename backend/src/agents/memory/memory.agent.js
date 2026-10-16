import crypto from 'node:crypto';
import { bus, EVENTS } from '../events.js';
import * as memoryService from '../../services/memory.service.js';
import * as teamRepository from '../../repositories/team.repository.js';
import * as personRepository from '../../repositories/person.repository.js';

const AGENT = 'Memory agent';
// Everyone has these, so they say nothing about how a team is composed.
const IGNORED_CATEGORIES = new Set(['language', 'tooling', 'topic']);

const log = (teamId, action, detail) =>
  teamRepository.addEvent({ id: crypto.randomUUID(), teamId, agent: AGENT, action, detail });

// Handoff from the Outreach agent: remember the confirmed team (episodic memory).
async function onTeamConfirmed({ teamId, name, members }) {
  const realUsers = await personRepository.findRealUsers(members);
  await Promise.all(
    realUsers.map((login) => memoryService.recordTeamHistory(login, { teamId, name, members }))
  );
  await log(
    teamId,
    'remembered team',
    `Saved "${name}" to ${realUsers.length} private memory graph(s). Waiting for ratings to learn what worked.`
  );
}

// After ratings: learn which skill mixes work for this user (procedural memory).
async function onFeedback({ me, teamId, members, ratings }) {
  const alreadyCounted = await memoryService.markTeamRated(me, teamId);
  if (alreadyCounted) {
    await log(teamId, 'kept patterns unchanged', 'Updated ratings were saved. This team was already counted in your patterns.');
    return;
  }

  const categories = (await teamRepository.getTeamCategories(members))
    .filter((category) => !IGNORED_CATEGORIES.has(category))
    .sort();
  if (!categories.length || !ratings.length) return;

  await memoryService.recordPattern(me, { categories, ratings });
  const average = (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1);
  await log(
    teamId,
    'learned a pattern',
    `Teams covering ${categories.join(' + ')} got an average of ${average}/5 from you. Saved to your private memory.`
  );
}

// A failing handler must never take the server down.
const guarded = (handler) => (payload) =>
  handler(payload).catch((err) => console.error(`${AGENT} failed:`, err.message));

export function registerMemoryAgent() {
  bus.on(EVENTS.teamConfirmed, guarded(onTeamConfirmed));
  bus.on(EVENTS.feedbackSubmitted, guarded(onFeedback));
}