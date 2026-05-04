import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from '../modules/auth/auth.routes';
import userRoutes from '../modules/user/user.routes';
import jobRoutes from '../modules/job/job.routes';
import applicationRoutes from '../modules/application/application.routes';
import { errorHandler } from '../middleware/errorHandler';

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/jobs', jobRoutes);
  app.use('/api/applications', applicationRoutes);

  app.use(errorHandler);

  return app;
}
