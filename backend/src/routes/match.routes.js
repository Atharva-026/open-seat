import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { findMatches, listSkills } from '../controllers/match.controller.js';

const router = Router();
router.get('/skills', requireAuth, listSkills);
router.post('/match', requireAuth, findMatches);

export default router;