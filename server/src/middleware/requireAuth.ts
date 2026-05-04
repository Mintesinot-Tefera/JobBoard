import { RequestHandler } from 'express';
import { verifyToken, COOKIE_NAME } from '../utils/jwt';
import { AppError } from '../utils/AppError';

export const requireAuth: RequestHandler = (req, _res, next) => {
  const token = req.cookies[COOKIE_NAME];

  if (!token) {
    throw new AppError(401, 'Not authenticated');
  }

  try {
    const { userId } = verifyToken(token);
    req.user = { id: userId };
    next();
  } catch {
    throw new AppError(401, 'Invalid or expired token');
  }
};
