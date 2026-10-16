import { HttpError } from '../utils/httpError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { listInbox } from '../services/team.service.js';
import { respondToInvite } from '../services/outreach.service.js';

export const getInbox = asyncHandler(async (req, res) => {
  res.json(await listInbox(req.user.githubLogin));
});

export const respond = asyncHandler(async (req, res) => {
  const { accept } = req.body ?? {};
  if (typeof accept !== 'boolean') throw new HttpError(400, '"accept" must be true or false');
  await respondToInvite({ inviteId: req.params.id, me: req.user.githubLogin, accept });
  res.status(204).end();
});