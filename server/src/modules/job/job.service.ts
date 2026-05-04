import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/AppError';
import { JobCategory } from '../../generated/prisma/client';
import type { CreateJobInput } from './job.schema';

const jobSelect = {
  id: true,
  title: true,
  description: true,
  category: true,
  companyName: true,
  companyLogo: true,
  location: true,
  salaryMin: true,
  salaryMax: true,
  employmentType: true,
  deadline: true,
  createdAt: true,
  updatedAt: true,
  postedBy: {
    select: {
      id: true,
      name: true,
    },
  },
};

export const jobService = {
  async getAll(category?: JobCategory) {
    const where = category ? { category } : {};

    return prisma.job.findMany({
      where,
      select: jobSelect,
      orderBy: { createdAt: 'desc' },
    });
  },

  async getById(id: string) {
    const job = await prisma.job.findUnique({
      where: { id },
      select: jobSelect,
    });

    if (!job) {
      throw new AppError(404, 'Job not found');
    }

    return job;
  },

  async create(userId: string, input: CreateJobInput) {
    return prisma.job.create({
      data: {
        title: input.title,
        description: input.description,
        category: input.category,
        companyName: input.companyName,
        companyLogo: input.companyLogo || null,
        location: input.location,
        salaryMin: input.salaryMin ?? null,
        salaryMax: input.salaryMax ?? null,
        employmentType: input.employmentType,
        deadline: input.deadline,
        postedById: userId,
      },
      select: jobSelect,
    });
  },
};
