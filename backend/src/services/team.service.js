import crypto from 'node:crypto';
import { HttpError } from '../utils/httpError.js';
import * as personRepository from '../repositories/person.repository.js';
import * as teamRepository from '../repositories/team.repository.js';
import { getProfile } from './profile.service.js';
import { sendInvites } from './outreach.service.js';
import { bus, EVENTS } from '../agents/events.js';

const HACKATHON = { id: 'graph-hacks-2026', name: 'Graph Hacks 2026' };
const MAX_TEAM_SIZE = 4;

// picks: [{ login, skills: [name] }] sent by the chat; keeps only short strings.
function cleanPicks(picks = []) {
  const map = {};
  for (const pick of picks) {
    if (pick && typeof pick.login === 'string' && Array.isArray(pick.skills)) {
      map[pick.login] = pick.skills.filter((s) => typeof s === 'string').map((s) => s.slice(0, 40)).slice(0, 5);
    }
  }
  return map;
}

export async function formTeam({ me, name, members, size, picks }) {
  const others = [...new Set(members)].filter((login) => login !== me);
  if (!others.length) throw new HttpError(400, 'Add at least one teammate');
  const seats = size ?? others.length + 1;
  if (!Number.isInteger(seats) || seats < others.length + 1 || seats > MAX_TEAM_SIZE) {
    throw new HttpError(400, `Team size must be between ${others.length + 1} and ${MAX_TEAM_SIZE}`);
  }
  const found = await personRepository.findExisting(others);
  if (found.length !== others.length) throw new HttpError(400, 'One or more teammates were not found');

  const team = { id: crypto.randomUUID(), name: name?.trim() || 'My team' };
  await teamRepository.createTeam({
    ...team,
    createdBy: me,
    size: seats,
    hackathonId: HACKATHON.id,
    hackathonName: HACKATHON.name,
  });

  const sender = await getProfile(me);
  await sendInvites({ team, senderName: sender?.name ?? me, logins: others, forSkills: cleanPicks(picks) });
  return team;
}

export async function listTeams(me) {
  const teams = await teamRepository.getTeams(me);
  if (!teams.length) return [];

  const ids = teams.map((t) => t.id);
  const logins = [...new Set(teams.flatMap((t) => t.members.map((m) => m.githubLogin)))];
  const [invites, events, skillRows] = await Promise.all([
    teamRepository.getInvitesForTeams(ids),
    teamRepository.getEventsForTeams(ids),
    teamRepository.getSkillsForPeople(logins),
  ]);
  const evidenceFor = (login) =>
    skillRows
      .filter((row) => row.login === login)
      .slice(0, 3)
      .map(({ name, level, evidence }) => ({ name, level, repos: (evidence ?? []).slice(0, 3) }));

  return teams.map((team) => ({
    ...team,
    size: team.size ?? MAX_TEAM_SIZE, // older teams can grow up to the maximum
    members: team.members.map((m) => ({ ...m, evidence: evidenceFor(m.githubLogin) })),
    invites: invites.filter((i) => i.teamId === team.id),
    events: events.filter((e) => e.teamId === team.id),
  }));
}

export async function inviteMore({ me, teamId, logins, picks }) {
  const team = await teamRepository.getTeamForInvite(teamId);
  if (!team || !team.members.includes(me)) throw new HttpError(404, 'Team not found');
  if (team.createdBy && team.createdBy !== me) {
    throw new HttpError(403, 'Only the person who created the team can invite more people');
  }

  const size = team.size ?? MAX_TEAM_SIZE;
  const fresh = [...new Set(logins)].filter((login) => !team.members.includes(login) && !team.pending.includes(login));
  if (!fresh.length) throw new HttpError(400, 'Those people are already on the team or invited');
  if (fresh.length > size - team.members.length - team.pending.length) {
    throw new HttpError(400, 'Not enough open seats');
  }
  const found = await personRepository.findExisting(fresh);
  if (found.length !== fresh.length) throw new HttpError(400, 'One or more teammates were not found');

  await teamRepository.setTeamStatus(teamId, 'forming');
  const sender = await getProfile(me);
  await sendInvites({
    team: { id: teamId, name: team.name },
    senderName: sender?.name ?? me,
    logins: fresh,
    forSkills: cleanPicks(picks),
  });
}

export async function submitFeedback({ me, teamId, entries }) {
  const team = await teamRepository.getTeam(teamId);
  if (!team || !team.members.includes(me)) throw new HttpError(404, 'Team not found');
  if (team.status !== 'confirmed') throw new HttpError(409, 'Ratings open once the team is confirmed');

  const ratesOnlyTeammates = entries.every((e) => e.to !== me && team.members.includes(e.to));
  if (!ratesOnlyTeammates) throw new HttpError(400, 'You can only rate your teammates');

  await teamRepository.saveFeedback({ from: me, hackathonId: team.hackathonId, entries });
  bus.emit(EVENTS.feedbackSubmitted, {
    me,
    teamId,
    members: team.members,
    ratings: entries.map((e) => e.rating),
  });
}

export const listInbox = (me) => teamRepository.getInbox(me);