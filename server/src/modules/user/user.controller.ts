import { RequestHandler } from 'express';
import { userService } from './user.service';

export const getMe: RequestHandler = async (req, res) => {
  const user = await userService.getById(req.user!.id);
  res.json({ user });
};

export const updateMe: RequestHandler = async (req, res) => {
  const user = await userService.updateProfile(req.user!.id, req.body);
  res.json({ user });
};
