import { Prisma } from '../generated/prisma/client';

export const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  bio: true,
  headline: true,
  location: true,
  website: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type PublicUser = Prisma.UserGetPayload<{ select: typeof publicUserSelect }>;
