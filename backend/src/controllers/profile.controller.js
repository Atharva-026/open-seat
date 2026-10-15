import { HttpError } from '../utils/httpError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getProfile } from '../services/profile.service.js';

export const getMe = asyncHandler(async (req, res) => {
  const profile = await getProfile(req.user.githubLogin);
  if (!profile) throw new HttpError(404, 'Profile not found');
  res.json(profile);
});