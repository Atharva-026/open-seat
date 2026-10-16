import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { getInbox, respond } from '../controllers/invite.controller.js';

const router = Router();
router.get('/invites', requireAuth, getInbox);
router.post('/invites/:id/respond', requireAuth, respond);

export default router;