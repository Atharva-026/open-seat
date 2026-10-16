import { HttpError } from '../utils/httpError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { runMatcherAgent } from '../agents/matcher/matcher.agent.js';

export const askMatcher = asyncHandler(async (req, res) => {
  const { message } = req.body ?? {};
  if (typeof message !== 'string' || !message.trim() || message.length > 500) {
    throw new HttpError(400, '"message" must be text up to 500 characters');
  }
  res.json(await runMatcherAgent({ me: req.user.githubLogin, message: message.trim() }));
});