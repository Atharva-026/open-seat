import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import matchRoutes from './routes/match.routes.js';
import profileRoutes from './routes/profile.routes.js';
import teamRoutes from './routes/team.routes.js';
import agentRoutes from './routes/agent.routes.js';
import memoryRoutes from './routes/memory.routes.js';
import inviteRoutes from './routes/invite.routes.js';
import seatRoutes from './routes/seat.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(dirname, '../../frontend/dist');

export function createApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(cors({ origin: env.frontendUrl, credentials: true, methods: ['GET', 'POST', 'PUT', 'DELETE'] }));
  app.use(express.json());
  app.use(cookieParser(env.sessionSecret));

  app.get('/health', (req, res) => res.json({ ok: true }));
  app.use('/auth', authRoutes);
  app.use('/api', profileRoutes);
  app.use('/api', matchRoutes);
  app.use('/api', teamRoutes);
  app.use('/api', agentRoutes);
  app.use('/api', memoryRoutes);
  app.use('/api', inviteRoutes);
  app.use('/api', seatRoutes);

  // Serve the built React app (same origin as the API) when frontend/dist exists.
  if (fs.existsSync(distDir)) {
    app.use(express.static(distDir));
    app.use((req, res, next) => {
      if (req.method !== 'GET' || /^\/(api|auth)(\/|$)/.test(req.path) || req.path === '/health') {
        return next();
      }
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.use(errorHandler);
  return app;
}