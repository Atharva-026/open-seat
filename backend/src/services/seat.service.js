import crypto from 'node:crypto';
import { HttpError } from '../utils/httpError.js';
import { demoWouldAccept } from '../utils/demoReply.js';
import { evidenceFor } from '../utils/evidence.js';
import { bus, EVENTS } from '../agents/events.js';
import * as seatRepository from '../repositories/seat.repository.js';
import * as skillRepository from '../repositories/skill.repository.js';
import * as teamRepository from '../repositories/team.repository.js';
import { getProfile } from './profile.service.js';

const AGENT = 'Open Seats board';
const COVERED_LEVEL = 3;
const WEIGHTS = { coverage: 0.6, strength: 0.3 };
const INTRO_BONUS = { direct: 10, via: 6 };

const log = (teamId, action, detail) =>
  teamRepository.addEvent({ id: crypto.randomUUID(), teamId, agent: AGENT, action, detail });

// How well your skills cover what a seat needs, using the same level-3 rule as the matcher.
function fitFor(needs, levels) {
  const have = needs.map((name) => ({ name, level: levels.get(name) ?? 0 }));
  const covered = have.filter((s) => s.level >= COVERED_LEVEL);
  const missing = have.filter((s) => s.level < COVERED_LEVEL);
  const coverage = needs.length ? covered.length / needs.length : 0;
  const strength = needs.length ? have.reduce((sum, s) => sum + s.level, 0) / needs.length / 5 : 0;
  const score = Math.round((WEIGHTS.coverage * coverage + WEIGHTS.strength * strength) * 100);
  return { have, covered, missing, score };
}

const strengthOf = (r) => Math.min(r.ratingA, r.ratingB) * 10 + r.ratingA + r.ratingB;

function bestIntro(teamId, direct, via) {
  const d = direct.filter((r) => r.teamId === teamId).sort((a, b) => b.rating - a.rating)[0];
  if (d) {
    return {
      type: 'direct',
      chain: [{ name: 'You', role: 'team' }, { name: d.memberName, role: 'candidate' }],
      ratings: [d.rating],
      text: `You have worked with ${d.memberName} on this team (rated ${d.rating}/5)`,
    };
  }
  const v = via.filter((r) => r.teamId === teamId).sort((a, b) => strengthOf(b) - strengthOf(a))[0];
  if (!v) return null;
  return {
    type: 'via',
    chain: [
      { name: 'You', role: 'team' },
      { name: v.viaName, role: 'via' },
      { name: v.memberName, role: 'candidate' },
    ],
    ratings: [v.ratingA, v.ratingB],
    text: `Ask ${v.viaName}, who worked with you (rated ${v.ratingA}/5) and with ${v.memberName} (rated ${v.ratingB}/5)`,
  };
}

export async function listBoard(me) {
  const myTeams = await seatRepository.getMyTeamIds(me);
  const [seats, skillRows, requests] = await Promise.all([
    seatRepository.listOpenSeats(myTeams),
    skillRepository.getSkillLevels(me),
    seatRepository.getMyRequests(me),
  ]);
  const levels = new Map(skillRows.map((row) => [row.name, row.level]));

  const teamIds = [...new Set(seats.map((s) => s.teamId))];
  const [direct, via] = teamIds.length
    ? await Promise.all([
      seatRepository.findDirectHistory(me, teamIds),
      seatRepository.findViaHistory(me, teamIds),
    ])
    : [[], []];

  const ranked = seats
    .map((seat) => {
      const fit = fitFor(seat.needs, levels);
      const intro = bestIntro(seat.teamId, direct, via);
      const reasons = [];
      if (fit.covered.length) {
        reasons.push(`You cover ${fit.covered.map((s) => `${s.name} (level ${s.level})`).join(', ')}`);
      }
      if (fit.missing.length) {
        reasons.push(`Below level ${COVERED_LEVEL} for you: ${fit.missing.map((s) => s.name).join(', ')}`);
      }
      if (intro) reasons.push(intro.text);

      return {
        id: seat.id,
        title: seat.title,
        pitch: seat.pitch,
        postedAt: seat.postedAt,
        teamId: seat.teamId,
        teamName: seat.teamName,
        ownerName: seat.ownerName,
        isDemo: seat.isDemo,
        size: seat.size,
        memberCount: seat.memberCount,
        needs: fit.have,
        canFill: fit.missing.length === 0,
        score: Math.min(100, fit.score + (intro ? INTRO_BONUS[intro.type] : 0)),
        reasons,
        intro: intro && { chain: intro.chain, ratings: intro.ratings },
        myRequest: requests.find((r) => r.seatId === seat.id)?.status ?? null,
      };
    })
    .sort((a, b) => b.score - a.score);

  return { seats: ranked, requests };
}

export async function postSeat({ me, teamId, title, pitch, skills }) {
  const capacity = await seatRepository.getSeatCapacity(teamId);
  if (!capacity || capacity.createdBy !== me) throw new HttpError(404, 'Team not found');
  if (capacity.size - capacity.members - capacity.pending - capacity.openSeats < 1) {
    throw new HttpError(409, 'Every open seat on this team is already posted or taken');
  }

  const known = new Map((await skillRepository.listSkills()).map((s) => [s.name.toLowerCase(), s.name]));
  const names = [...new Set(skills.map((s) => known.get(s.trim().toLowerCase())).filter(Boolean))];
  if (!names.length) throw new HttpError(400, 'Pick at least one known skill');

  const id = crypto.randomUUID();
  await seatRepository.createSeat({ id, teamId, title, pitch, skills: names });
  await log(teamId, 'posted a seat', `"${title}" is on the board, looking for ${names.join(', ')}`);
  return { id };
}

export async function closeSeat({ me, seatId }) {
  const seat = await seatRepository.getSeat(seatId);
  if (!seat || seat.ownerLogin !== me) throw new HttpError(404, 'Seat not found');
  await seatRepository.setSeatStatus(seatId, 'closed');
  await log(seat.teamId, 'took a seat down', `"${seat.title}" was removed from the board`);
}

// Shared by the team lead's answer and the simulated reply of demo teams.
async function resolveRequest(request, accepted, simulated) {
  await seatRepository.answerRequest({ id: request.id, accepted, simulated });
  await log(
    request.teamId,
    accepted ? 'accepted a request' : 'declined a request',
    `${request.name} ${accepted ? 'joined for' : 'was declined for'} "${request.seatTitle}"${simulated ? ' (demo team, simulated reply)' : ''}`
  );
  if (!accepted) return;

  await teamRepository.addMember(request.teamId, request.login);
  await seatRepository.setSeatStatus(request.seatId, 'filled');
  if ((await teamRepository.countPendingInvites(request.teamId)) === 0) {
    await teamRepository.setTeamStatus(request.teamId, 'confirmed');
  }
  const outcome = await teamRepository.getTeamOutcome(request.teamId);
  bus.emit(EVENTS.teamConfirmed, { teamId: request.teamId, ...outcome });
}

export async function requestSeat({ me, seatId, message }) {
  const seat = await seatRepository.getSeat(seatId);
  if (!seat || seat.status !== 'open') throw new HttpError(404, 'This seat is no longer open');
  if (seat.ownerLogin === me || (await seatRepository.getMyTeamIds(me)).includes(seat.teamId)) {
    throw new HttpError(400, 'You are already on this team');
  }
  if (await seatRepository.hasRequested(me, seatId)) {
    throw new HttpError(409, 'You already asked for this seat');
  }

  const id = crypto.randomUUID();
  await seatRepository.createRequest({ id, seatId, login: me, message });
  const requester = await getProfile(me);
  const name = requester?.name ?? me;
  await log(seat.teamId, 'seat requested', `${name} asked for "${seat.title}"`);

  if (seat.ownerIsDemo) {
    const request = { id, teamId: seat.teamId, seatId, seatTitle: seat.title, login: me, name };
    await resolveRequest(request, demoWouldAccept(me, seatId), true);
  }
  return { id };
}

export async function listIncoming(me) {
  const rows = await seatRepository.getIncomingRequests(me);
  if (!rows.length) return [];
  const skillRows = await teamRepository.getSkillsForPeople([...new Set(rows.map((r) => r.login))]);
  return rows.map((row) => ({ ...row, evidence: evidenceFor(skillRows, row.login) }));
}

export async function respondToRequest({ me, requestId, accept }) {
  const request = await seatRepository.getRequest(requestId);
  if (!request || request.ownerLogin !== me) throw new HttpError(404, 'Request not found');
  if (request.status !== 'pending' || request.seatStatus !== 'open') {
    throw new HttpError(409, 'This request was already answered');
  }
  await resolveRequest(request, accept, false);
}