import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { createTeam, listTeams, submitFeedback } from '../controllers/team.controller.js';

const router = Router();
router.get('/teams', requireAuth, listTeams);
router.post('/teams', requireAuth, createTeam);
router.post('/teams/:id/feedback', requireAuth, submitFeedback);

export default router;