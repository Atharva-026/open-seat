import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { getMemory, putPreference, deletePreference, deleteMemory } from '../controllers/memory.controller.js';

const router = Router();
router.get('/memory', requireAuth, getMemory);
router.put('/memory/preferences/:key', requireAuth, putPreference);
router.delete('/memory/preferences/:key', requireAuth, deletePreference);
router.delete('/memory', requireAuth, deleteMemory);

export default router;