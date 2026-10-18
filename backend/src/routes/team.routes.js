import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { writeLimiter } from '../middleware/rateLimits.js';
import { createTeam, invitePeople, listTeams, submitFeedback } from '../controllers/team.controller.js';

const router = Router();
router.get('/teams', requireAuth, listTeams);
router.post('/teams', requireAuth, writeLimiter, createTeam);
router.post('/teams/:id/invite', requireAuth, writeLimiter, invitePeople);
router.post('/teams/:id/invites', requireAuth, writeLimiter, invitePeople);
router.post('/teams/:id/feedback', requireAuth, submitFeedback);

export default router;