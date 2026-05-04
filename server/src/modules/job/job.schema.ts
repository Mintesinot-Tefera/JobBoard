import { z } from 'zod';

const jobCategoryValues = [
  'ENGINEERING',
  'DESIGN',
  'MARKETING',
  'SALES',
  'FINANCE',
  'HR',
  'OPERATIONS',
  'PRODUCT',
  'DATA',
  'OTHER',
] as const;

const employmentTypeValues = [
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
  'INTERNSHIP',
] as const;

export const jobListQuerySchema = z.object({
  category: z.enum(jobCategoryValues).optional(),
});

export type JobListQuery = z.infer<typeof jobListQuerySchema>;

export const createJobSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(200),
    description: z.string().trim().min(1, 'Description is required').max(10000),
    category: z.enum(jobCategoryValues),
    companyName: z.string().trim().min(1, 'Company name is required').max(200),
    companyLogo: z.string().trim().url().max(500).optional().or(z.literal('')),
    location: z.string().trim().min(1, 'Location is required').max(200),
    salaryMin: z.coerce.number().int().nonnegative().optional(),
    salaryMax: z.coerce.number().int().nonnegative().optional(),
    employmentType: z.enum(employmentTypeValues),
    deadline: z.coerce.date(),
  })
  .refine(
    (data) =>
      data.salaryMin === undefined ||
      data.salaryMax === undefined ||
      data.salaryMin <= data.salaryMax,
    {
      message: 'Minimum salary cannot exceed maximum salary',
      path: ['salaryMin'],
    },
  );

export type CreateJobInput = z.infer<typeof createJobSchema>;
