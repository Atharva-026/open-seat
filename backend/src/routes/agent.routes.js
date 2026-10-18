import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { matcherLimiter } from '../middleware/rateLimits.js';
import { askMatcher } from '../controllers/agent.controller.js';

const router = Router();
router.post('/agent/matcher', requireAuth, matcherLimiter, askMatcher);

export default router;