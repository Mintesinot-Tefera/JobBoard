import { prisma } from '../../lib/prisma';
import { publicUserSelect, PublicUser } from '../../lib/userSelect';
import { AppError } from '../../utils/AppError';
import { UpdateProfileInput } from './user.schema';

export const userService = {
  async getById(id: string): Promise<PublicUser> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return user;
  },

  async updateProfile(id: string, data: UpdateProfileInput): Promise<PublicUser> {
    return prisma.user.update({
      where: { id },
      data,
      select: publicUserSelect,
    });
  },
};
