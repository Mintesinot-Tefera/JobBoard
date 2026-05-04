import { RequestHandler } from 'express';
import { jobService } from './job.service';
import { jobListQuerySchema } from './job.schema';
import { JobCategory } from '../../generated/prisma/client';

export const list: RequestHandler = async (req, res) => {
  const { category } = jobListQuerySchema.parse(req.query);
  const jobs = await jobService.getAll(category as JobCategory | undefined);
  res.json({ jobs });
};

export const getById: RequestHandler<{ id: string }> = async (req, res) => {
  const job = await jobService.getById(req.params.id);
  res.json({ job });
};

export const create: RequestHandler = async (req, res) => {
  const job = await jobService.create(req.user!.id, req.body);
  res.status(201).json({ job });
};
