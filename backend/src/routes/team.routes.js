import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { createTeam, invitePeople, listTeams, submitFeedback } from '../controllers/team.controller.js';

const router = Router();
router.get('/teams', requireAuth, listTeams);
router.post('/teams', requireAuth, createTeam);
router.post('/teams/:id/invite', requireAuth, invitePeople);
router.post('/teams/:id/invites', requireAuth, invitePeople);
router.post('/teams/:id/feedback', requireAuth, submitFeedback);

export default router;