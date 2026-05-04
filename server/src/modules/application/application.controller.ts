import { RequestHandler } from 'express';
import { applicationService } from './application.service';

export const create: RequestHandler<{ jobId: string }> = async (req, res) => {
  const application = await applicationService.create(
    req.user!.id,
    req.params.jobId,
    req.body,
  );
  res.status(201).json({ application });
};

export const getMyApplications: RequestHandler = async (req, res) => {
  const applications = await applicationService.getMyApplications(req.user!.id);
  res.json({ applications });
};

export const getById: RequestHandler<{ id: string }> = async (req, res) => {
  const application = await applicationService.getById(
    req.params.id,
    req.user!.id,
  );
  res.json({ application });
};

export const withdraw: RequestHandler<{ id: string }> = async (req, res) => {
  const application = await applicationService.withdraw(
    req.params.id,
    req.user!.id,
  );
  res.json({ application });
};

export const getAppliedJobIds: RequestHandler = async (req, res) => {
  const jobIds = await applicationService.getAppliedJobIds(req.user!.id);
  res.json({ jobIds });
};
