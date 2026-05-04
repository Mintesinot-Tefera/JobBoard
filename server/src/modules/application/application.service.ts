import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/AppError';
import { CreateApplicationInput } from './application.schema';

const applicationSelect = {
  id: true,
  coverLetter: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  job: {
    select: {
      id: true,
      title: true,
      companyName: true,
      companyLogo: true,
      location: true,
      employmentType: true,
      deadline: true,
    },
  },
};

export const applicationService = {
  async create(userId: string, jobId: string, input: CreateApplicationInput) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true },
    });

    if (!job) {
      throw new AppError(404, 'Job not found');
    }

    const existing = await prisma.application.findUnique({
      where: { userId_jobId: { userId, jobId } },
      select: { id: true },
    });

    if (existing) {
      throw new AppError(409, 'You have already applied to this job', 'ALREADY_APPLIED');
    }

    return prisma.application.create({
      data: {
        userId,
        jobId,
        coverLetter: input.coverLetter,
      },
      select: applicationSelect,
    });
  },

  async getMyApplications(userId: string) {
    return prisma.application.findMany({
      where: { userId },
      select: applicationSelect,
      orderBy: { createdAt: 'desc' },
    });
  },

  async getById(id: string, userId: string) {
    const application = await prisma.application.findUnique({
      where: { id },
      select: { ...applicationSelect, userId: true },
    });

    if (!application) {
      throw new AppError(404, 'Application not found');
    }

    if (application.userId !== userId) {
      throw new AppError(403, 'Forbidden');
    }

    return application;
  },

  async withdraw(id: string, userId: string) {
    const application = await prisma.application.findUnique({
      where: { id },
      select: { id: true, userId: true, status: true },
    });

    if (!application) {
      throw new AppError(404, 'Application not found');
    }

    if (application.userId !== userId) {
      throw new AppError(403, 'Forbidden');
    }

    if (application.status === 'WITHDRAWN') {
      throw new AppError(400, 'Application is already withdrawn');
    }

    return prisma.application.update({
      where: { id },
      data: { status: 'WITHDRAWN' },
      select: applicationSelect,
    });
  },

  async getAppliedJobIds(userId: string): Promise<string[]> {
    const applications = await prisma.application.findMany({
      where: { userId },
      select: { jobId: true },
    });
    return applications.map((a) => a.jobId);
  },
};
