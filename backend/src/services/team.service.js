import crypto from 'node:crypto';
import { HttpError } from '../utils/httpError.js';
import * as personRepository from '../repositories/person.repository.js';
import * as teamRepository from '../repositories/team.repository.js';

const HACKATHON = { id: 'graph-hacks-2026', name: 'Graph Hacks 2026' };
const MAX_TEAM_SIZE = 4;

export async function formTeam({ me, name, members }) {
  const others = [...new Set(members)].filter((login) => login !== me);
  if (!others.length) throw new HttpError(400, 'Add at least one teammate');
  if (others.length + 1 > MAX_TEAM_SIZE) {
    throw new HttpError(400, `A team can have at most ${MAX_TEAM_SIZE} people`);
  }
  const found = await personRepository.findExisting(others);
  if (found.length !== others.length) throw new HttpError(400, 'One or more teammates were not found');

  const team = { id: crypto.randomUUID(), name: name?.trim() || 'My team' };
  await teamRepository.createTeam({
    ...team,
    hackathonId: HACKATHON.id,
    hackathonName: HACKATHON.name,
    members: [me, ...others],
  });
  return team;
}

export const listTeams = (me) => teamRepository.getTeams(me);

export async function submitFeedback({ me, teamId, entries }) {
  const team = await teamRepository.getTeam(teamId);
  if (!team || !team.members.includes(me)) throw new HttpError(404, 'Team not found');

  const ratesOnlyTeammates = entries.every((e) => e.to !== me && team.members.includes(e.to));
  if (!ratesOnlyTeammates) throw new HttpError(400, 'You can only rate your teammates');

  await teamRepository.saveFeedback({ from: me, hackathonId: team.hackathonId, entries });
}