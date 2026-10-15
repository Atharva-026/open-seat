import { HttpError } from '../utils/httpError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { findTeammates, listAvailableSkills } from '../services/match.service.js';

const MAX_NEEDED = 10;
const isStringList = (value) => Array.isArray(value) && value.every((v) => typeof v === 'string');

export const listSkills = asyncHandler(async (req, res) => {
  res.json(await listAvailableSkills());
});

export const findMatches = asyncHandler(async (req, res) => {
  const { needed, teammates, limit } = req.body ?? {};

  if (!isStringList(needed) || needed.length < 1 || needed.length > MAX_NEEDED) {
    throw new HttpError(400, `"needed" must be a list of 1 to ${MAX_NEEDED} skill names`);
  }
  if (teammates !== undefined && !isStringList(teammates)) {
    throw new HttpError(400, '"teammates" must be a list of GitHub logins');
  }
  const safeLimit = Number.isInteger(limit) && limit > 0 && limit <= 20 ? limit : 8;

  res.json(
    await findTeammates({ me: req.user.githubLogin, needed, teammates, limit: safeLimit })
  );
});