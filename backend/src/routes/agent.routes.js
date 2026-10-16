import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { askMatcher } from '../controllers/agent.controller.js';

const router = Router();
router.post('/agent/matcher', requireAuth, askMatcher);

export default router;