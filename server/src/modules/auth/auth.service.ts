import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../../lib/prisma';
import { publicUserSelect, PublicUser } from '../../lib/userSelect';
import { AppError } from '../../utils/AppError';
import { RegisterInput, LoginInput } from './auth.schema';
import { env } from '../../config/env';

const SALT_ROUNDS = 12;
const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

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

    if (!user || !user.passwordHash) {
      throw new AppError(401, 'Invalid email or password');
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new AppError(401, 'Invalid email or password');
    }

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  },

  async googleSignIn(credential: string): Promise<PublicUser> {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: env.GOOGLE_CLIENT_ID,
    }).catch(() => {
      throw new AppError(401, 'Invalid Google credential');
    });

    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email) {
      throw new AppError(401, 'Invalid Google credential');
    }

    const { sub: googleId, email, name = 'Google User' } = payload;

    const existing = await prisma.user.findFirst({
      where: { OR: [{ googleId }, { email }] },
    });

    if (existing) {
      const updated = await prisma.user.update({
        where: { id: existing.id },
        data: { googleId },
        select: publicUserSelect,
      });
      return updated;
    }

    return prisma.user.create({
      data: { email, name, googleId },
      select: publicUserSelect,
    });
  },
};
