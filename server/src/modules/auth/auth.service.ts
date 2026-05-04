import bcrypt from 'bcrypt';
import { prisma } from '../../lib/prisma';
import { publicUserSelect, PublicUser } from '../../lib/userSelect';
import { AppError } from '../../utils/AppError';
import { RegisterInput, LoginInput } from './auth.schema';

const SALT_ROUNDS = 12;

export const authService = {
  async register(input: RegisterInput): Promise<PublicUser> {
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    });

    if (existing) {
      throw new AppError(409, 'Email already registered', 'EMAIL_TAKEN');
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    return prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        passwordHash,
      },
      select: publicUserSelect,
    });
  },

  async login(input: LoginInput): Promise<PublicUser> {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new AppError(401, 'Invalid email or password');
    }

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  },
};
