import { Router } from 'express';
import { startLogin, handleCallback, logout } from '../controllers/auth.controller.js';

const router = Router();
router.get('/github', startLogin);
router.get('/github/callback', handleCallback);
router.post('/logout', logout);

export default router;