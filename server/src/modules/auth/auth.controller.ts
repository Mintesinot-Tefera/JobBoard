import { RequestHandler } from 'express';
import { authService } from './auth.service';
import { signToken, COOKIE_NAME, cookieOptions } from '../../utils/jwt';

export const register: RequestHandler = async (req, res) => {
  const user = await authService.register(req.body);
  const token = signToken({ userId: user.id });
  res.cookie(COOKIE_NAME, token, cookieOptions);
  res.status(201).json({ user });
};

export const login: RequestHandler = async (req, res) => {
  const user = await authService.login(req.body);
  const token = signToken({ userId: user.id });
  res.cookie(COOKIE_NAME, token, cookieOptions);
  res.json({ user });
};

export const logout: RequestHandler = (_req, res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions);
  res.status(204).end();
};

export const googleSignIn: RequestHandler = async (req, res) => {
  const { credential } = req.body as { credential?: string };
  if (!credential) {
    res.status(400).json({ message: 'credential is required' });
    return;
  }
  const user = await authService.googleSignIn(credential);
  const token = signToken({ userId: user.id });
  res.cookie(COOKIE_NAME, token, cookieOptions);
  res.json({ user });
};
