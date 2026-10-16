import { HttpError } from '../utils/httpError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { runMatcherAgent } from '../agents/matcher/matcher.agent.js';

const MAX_HISTORY = 10;
const isTurn = (t) =>
  t && ['user', 'assistant'].includes(t.role) && typeof t.content === 'string' && t.content.length <= 2000;

export const askMatcher = asyncHandler(async (req, res) => {
  const { message, history = [] } = req.body ?? {};

  if (typeof message !== 'string' || !message.trim() || message.length > 500) {
    throw new HttpError(400, '"message" must be text up to 500 characters');
  }
  if (!Array.isArray(history) || !history.every(isTurn)) {
    throw new HttpError(400, '"history" must be a list of chat messages');
  }

  const recent = history.slice(-MAX_HISTORY).map(({ role, content }) => ({ role, content }));
  res.json(await runMatcherAgent({ me: req.user.githubLogin, message: message.trim(), history: recent }));
});