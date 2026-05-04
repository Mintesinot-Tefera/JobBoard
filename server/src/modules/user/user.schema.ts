import { z } from 'zod';

const emptyToNull = (v: unknown) => (v === '' ? null : v);

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    bio: z.preprocess(emptyToNull, z.string().max(2000).nullable()),
    headline: z.preprocess(emptyToNull, z.string().max(200).nullable()),
    location: z.preprocess(emptyToNull, z.string().max(100).nullable()),
    website: z.preprocess(emptyToNull, z.string().url().nullable()),
  })
  .partial();

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
