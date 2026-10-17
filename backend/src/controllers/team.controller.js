import { HttpError } from '../utils/httpError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as teamService from '../services/team.service.js';

const isStringList = (v) => Array.isArray(v) && v.every((s) => typeof s === 'string');
const DELIVERED = ['yes', 'partly', 'no'];
const isValidEntry = (e) =>
  e && typeof e.to === 'string' && Number.isInteger(e.rating) && e.rating >= 1 && e.rating <= 5 &&
  (e.note === undefined || (typeof e.note === 'string' && e.note.length <= 140)) &&
  (e.delivered === undefined || e.delivered === '' || DELIVERED.includes(e.delivered));

export const createTeam = asyncHandler(async (req, res) => {
  const { name, members, size, picks } = req.body ?? {};
  if (picks !== undefined && !Array.isArray(picks)) throw new HttpError(400, '"picks" must be a list');
  if (!isStringList(members)) throw new HttpError(400, '"members" must be a list of GitHub logins');
  if (name !== undefined && (typeof name !== 'string' || name.length > 40)) {
    throw new HttpError(400, '"name" must be a string up to 40 characters');
  }
  if (size !== undefined && !Number.isInteger(size)) throw new HttpError(400, '"size" must be a whole number');
  res.status(201).json(await teamService.formTeam({ me: req.user.githubLogin, name, members, size, picks }));
});

export const invitePeople = asyncHandler(async (req, res) => {
  const { members, picks } = req.body ?? {};
  if (picks !== undefined && !Array.isArray(picks)) throw new HttpError(400, '"picks" must be a list');
  if (!isStringList(members) || !members.length) {
    throw new HttpError(400, '"members" must be a list of GitHub logins');
  }
  await teamService.inviteMore({ me: req.user.githubLogin, teamId: req.params.id, logins: members, picks });
  res.status(204).end();
});

export const listTeams = asyncHandler(async (req, res) => {
  res.json(await teamService.listTeams(req.user.githubLogin));
});

export const submitFeedback = asyncHandler(async (req, res) => {
  const { entries } = req.body ?? {};
  if (!Array.isArray(entries) || !entries.length || !entries.every(isValidEntry)) {
    throw new HttpError(400, 'Each entry needs a teammate login and a rating from 1 to 5');
  }
  const cleaned = entries.map((e) => ({
    to: e.to, rating: e.rating, note: (e.note ?? '').trim(), delivered: e.delivered ?? '',
  }));
  await teamService.submitFeedback({ me: req.user.githubLogin, teamId: req.params.id, entries: cleaned });
  res.status(204).end();
});