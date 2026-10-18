import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import {
  getBoard, postSeat, closeSeat, requestSeat, getIncoming, respondToRequest,
} from '../controllers/seat.controller.js';

const router = Router();
router.get('/board', requireAuth, getBoard);
router.post('/teams/:id/seats', requireAuth, postSeat);
router.delete('/seats/:id', requireAuth, closeSeat);
router.post('/seats/:id/request', requireAuth, requestSeat);
router.get('/seat-requests', requireAuth, getIncoming);
router.post('/seat-requests/:id/respond', requireAuth, respondToRequest);

export default router;