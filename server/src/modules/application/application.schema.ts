import { z } from 'zod';

export const createApplicationSchema = z.object({
  coverLetter: z.string().max(5000).optional(),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
