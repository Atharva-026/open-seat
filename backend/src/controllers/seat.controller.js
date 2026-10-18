import { HttpError } from '../utils/httpError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as seatService from '../services/seat.service.js';

const isStringList = (v) => Array.isArray(v) && v.every((s) => typeof s === 'string');

export const getBoard = asyncHandler(async (req, res) => {
  res.json(await seatService.listBoard(req.user.githubLogin));
});

export const postSeat = asyncHandler(async (req, res) => {
  const { title, pitch = '', skills } = req.body ?? {};
  if (typeof title !== 'string' || title.trim().length < 3 || title.length > 60) {
    throw new HttpError(400, '"title" must be 3 to 60 characters');
  }
  if (typeof pitch !== 'string' || pitch.length > 200) {
    throw new HttpError(400, '"pitch" must be text up to 200 characters');
  }
  if (!isStringList(skills) || skills.length < 1 || skills.length > 5) {
    throw new HttpError(400, '"skills" must be 1 to 5 skill names');
  }
  const created = await seatService.postSeat({
    me: req.user.githubLogin, teamId: req.params.id, title: title.trim(), pitch: pitch.trim(), skills,
  });
  res.status(201).json(created);
});

export const closeSeat = asyncHandler(async (req, res) => {
  await seatService.closeSeat({ me: req.user.githubLogin, seatId: req.params.id });
  res.status(204).end();
});

export const requestSeat = asyncHandler(async (req, res) => {
  const { message = '' } = req.body ?? {};
  if (typeof message !== 'string' || message.length > 140) {
    throw new HttpError(400, '"message" must be text up to 140 characters');
  }
  const created = await seatService.requestSeat({
    me: req.user.githubLogin, seatId: req.params.id, message: message.trim(),
  });
  res.status(201).json(created);
});

export const getIncoming = asyncHandler(async (req, res) => {
  res.json(await seatService.listIncoming(req.user.githubLogin));
});

export const respondToRequest = asyncHandler(async (req, res) => {
  const { accept } = req.body ?? {};
  if (typeof accept !== 'boolean') throw new HttpError(400, '"accept" must be true or false');
  await seatService.respondToRequest({ me: req.user.githubLogin, requestId: req.params.id, accept });
  res.status(204).end();
});