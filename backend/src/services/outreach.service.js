import crypto from 'node:crypto';
import { HttpError } from '../utils/httpError.js';
import { bus, EVENTS } from '../agents/events.js';
import { draftInvite } from '../agents/outreach/outreach.agent.js';
import * as teamRepository from '../repositories/team.repository.js';
import { getProfile } from './profile.service.js';

const AGENT = 'Outreach agent';

const log = (teamId, action, detail) =>
  teamRepository.addEvent({ id: crypto.randomUUID(), teamId, agent: AGENT, action, detail });

// Demo personas reply on their own, deterministically. Every such reply is labelled simulated.
function demoWouldAccept(login, teamId) {
  const byte = crypto.createHash('sha1').update(`${login}:${teamId}`).digest()[0];
  return byte % 5 !== 0;
}

async function resolveIfComplete(teamId) {
  if ((await teamRepository.countPendingInvites(teamId)) > 0) return;

  const outcome = await teamRepository.getTeamOutcome(teamId);
  if (outcome.members.length < 2) {
    await teamRepository.setTeamStatus(teamId, 'closed');
    await log(teamId, 'team closed', 'Every invitation was answered and nobody accepted.');
    return;
  }

  await teamRepository.setTeamStatus(teamId, 'confirmed');
  await log(
    teamId,
    'team confirmed',
    `All invitations answered. ${outcome.members.length} members confirmed. Handing off to the Memory agent.`
  );
  bus.emit(EVENTS.teamConfirmed, { teamId, ...outcome });
}

async function answer(invite, accepted, simulated) {
  await teamRepository.answerInvite({
    id: invite.id, teamId: invite.teamId, login: invite.login, accepted, simulated,
  });
  await log(
    invite.teamId,
    accepted ? 'accepted' : 'declined',
    `${invite.name}${simulated ? ' (demo persona, simulated reply)' : ''} ${accepted ? 'accepted' : 'declined'} the invitation`
  );
  await resolveIfComplete(invite.teamId);
}

export async function respondToInvite({ inviteId, me, accept }) {
  const invite = await teamRepository.getInvite(inviteId);
  if (!invite || invite.login !== me) throw new HttpError(404, 'Invitation not found');
  if (invite.status !== 'pending') throw new HttpError(409, 'You already answered this invitation');
  await answer(invite, accept, false);
}

export async function sendInvites({ team, senderName, logins, forSkills = {} }) {
  await log(team.id, 'started', `Drafting ${logins.length} invitation(s) for ${team.name}`);

  const sent = [];
  for (const login of logins) {
    const profile = await getProfile(login);
    const { message, drafted } = await draftInvite({ senderName, teamName: team.name, profile });
    const id = crypto.randomUUID();
    await teamRepository.createInvite({ teamId: team.id, id, login, message, forSkills: forSkills[login] ?? [] });
    await log(team.id, 'invited', `${profile.name} was invited (${drafted === 'ai' ? 'AI-drafted' : 'template'} message)`);
    sent.push({ id, teamId: team.id, login, name: profile.name, isDemo: Boolean(profile.isDemo) });
  }

  for (const invite of sent.filter((s) => s.isDemo)) {
    await answer(invite, demoWouldAccept(invite.login, team.id), true);
  }
}