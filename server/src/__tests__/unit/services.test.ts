import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '../../lib/prisma';
import { authService } from '../../modules/auth/auth.service';
import { jobService } from '../../modules/job/job.service';
import { applicationService } from '../../modules/application/application.service';
import { userService } from '../../modules/user/user.service';
import { AppError } from '../../utils/AppError';

// Type-safe mock helpers
const mockPrisma = prisma as unknown as {
  user: {
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  job: {
    findMany: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  application: {
    findUnique: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Auth Service', () => {
  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        bio: null,
        headline: null,
        location: null,
        website: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);

      const result = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        select: { id: true },
      });
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'test@example.com',
            name: 'Test User',
          }),
        }),
      );
    });

    it('should throw 409 if email is already registered', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing-user' });

      await expect(
        authService.register({
          email: 'existing@example.com',
          password: 'password123',
          name: 'Test',
        }),
      ).rejects.toThrow(AppError);

      try {
        await authService.register({
          email: 'existing@example.com',
          password: 'password123',
          name: 'Test',
        });
      } catch (err) {
        expect((err as AppError).statusCode).toBe(409);
        expect((err as AppError).code).toBe('EMAIL_TAKEN');
      }
    });

    it('should hash the password before storing', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: 'user-1' });

      await authService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test',
      });

      const createCall = mockPrisma.user.create.mock.calls[0][0];
      expect(createCall.data.passwordHash).toBeDefined();
      expect(createCall.data.passwordHash).not.toBe('password123');
    });
  });

  describe('login', () => {
    it('should throw 401 for non-existent email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'nobody@example.com', password: 'pass123' }),
      ).rejects.toThrow(AppError);

      try {
        await authService.login({ email: 'nobody@example.com', password: 'pass123' });
      } catch (err) {
        expect((err as AppError).statusCode).toBe(401);
        expect((err as AppError).message).toBe('Invalid email or password');
      }
    });

    it('should throw 401 for wrong password', async () => {
      // bcrypt hash of "correctpassword"
      const bcrypt = await import('bcrypt');
      const hash = await bcrypt.hash('correctpassword', 4); // low rounds for test speed

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: hash,
        name: 'Test',
      });

      await expect(
        authService.login({ email: 'test@example.com', password: 'wrongpassword' }),
      ).rejects.toThrow(AppError);
    });

    it('should return user without passwordHash on successful login', async () => {
      const bcrypt = await import('bcrypt');
      const hash = await bcrypt.hash('password123', 4);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: hash,
        name: 'Test',
        bio: null,
        headline: null,
        location: null,
        website: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.id).toBe('user-1');
      expect(result.email).toBe('test@example.com');
      expect((result as any).passwordHash).toBeUndefined();
    });
  });
});

describe('Job Service', () => {
  describe('getAll', () => {
    it('should return all jobs when no category filter', async () => {
      const mockJobs = [
        { id: 'job-1', title: 'Engineer' },
        { id: 'job-2', title: 'Designer' },
      ];
      mockPrisma.job.findMany.mockResolvedValue(mockJobs);

      const result = await jobService.getAll();

      expect(result).toEqual(mockJobs);
      expect(mockPrisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
          orderBy: { createdAt: 'desc' },
        }),
      );
    });

    it('should filter by category when provided', async () => {
      mockPrisma.job.findMany.mockResolvedValue([]);

      await jobService.getAll('ENGINEERING' as any);

      expect(mockPrisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { category: 'ENGINEERING' },
        }),
      );
    });
  });

  describe('getById', () => {
    it('should return a job by id', async () => {
      const mockJob = { id: 'job-1', title: 'Engineer' };
      mockPrisma.job.findUnique.mockResolvedValue(mockJob);

      const result = await jobService.getById('job-1');
      expect(result).toEqual(mockJob);
    });

    it('should throw 404 if job not found', async () => {
      mockPrisma.job.findUnique.mockResolvedValue(null);

      await expect(jobService.getById('nonexistent')).rejects.toThrow(AppError);
      try {
        await jobService.getById('nonexistent');
      } catch (err) {
        expect((err as AppError).statusCode).toBe(404);
      }
    });
  });

  describe('create', () => {
    it('should create a new job', async () => {
      const input = {
        title: 'Software Engineer',
        description: 'Build things',
        category: 'ENGINEERING' as const,
        companyName: 'Acme',
        location: 'Remote',
        employmentType: 'FULL_TIME' as const,
        deadline: new Date('2026-12-31'),
      };
      const mockJob = { id: 'job-1', ...input };
      mockPrisma.job.create.mockResolvedValue(mockJob);

      const result = await jobService.create('user-1', input);

      expect(result).toEqual(mockJob);
      expect(mockPrisma.job.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'Software Engineer',
            postedById: 'user-1',
          }),
        }),
      );
    });
  });
});

describe('Application Service', () => {
  describe('create', () => {
    it('should create a new application', async () => {
      mockPrisma.job.findUnique.mockResolvedValue({ id: 'job-1' });
      mockPrisma.application.findUnique.mockResolvedValue(null);
      const mockApp = {
        id: 'app-1',
        coverLetter: 'I want this job',
        status: 'SUBMITTED',
      };
      mockPrisma.application.create.mockResolvedValue(mockApp);

      const result = await applicationService.create('user-1', 'job-1', {
        coverLetter: 'I want this job',
      });

      expect(result).toEqual(mockApp);
    });

    it('should throw 404 if job does not exist', async () => {
      mockPrisma.job.findUnique.mockResolvedValue(null);

      await expect(
        applicationService.create('user-1', 'nonexistent', {}),
      ).rejects.toThrow(AppError);

      try {
        await applicationService.create('user-1', 'nonexistent', {});
      } catch (err) {
        expect((err as AppError).statusCode).toBe(404);
      }
    });

    it('should throw 409 if already applied', async () => {
      mockPrisma.job.findUnique.mockResolvedValue({ id: 'job-1' });
      mockPrisma.application.findUnique.mockResolvedValue({ id: 'existing-app' });

      await expect(
        applicationService.create('user-1', 'job-1', {}),
      ).rejects.toThrow(AppError);

      try {
        await applicationService.create('user-1', 'job-1', {});
      } catch (err) {
        expect((err as AppError).statusCode).toBe(409);
        expect((err as AppError).code).toBe('ALREADY_APPLIED');
      }
    });
  });

  describe('getMyApplications', () => {
    it('should return user applications', async () => {
      const mockApps = [{ id: 'app-1' }, { id: 'app-2' }];
      mockPrisma.application.findMany.mockResolvedValue(mockApps);

      const result = await applicationService.getMyApplications('user-1');

      expect(result).toEqual(mockApps);
      expect(mockPrisma.application.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1' },
          orderBy: { createdAt: 'desc' },
        }),
      );
    });
  });

  describe('getById', () => {
    it('should return application if user owns it', async () => {
      const mockApp = { id: 'app-1', userId: 'user-1', status: 'SUBMITTED' };
      mockPrisma.application.findUnique.mockResolvedValue(mockApp);

      const result = await applicationService.getById('app-1', 'user-1');
      expect(result).toEqual(mockApp);
    });

    it('should throw 404 if application not found', async () => {
      mockPrisma.application.findUnique.mockResolvedValue(null);

      await expect(
        applicationService.getById('nonexistent', 'user-1'),
      ).rejects.toThrow(AppError);
    });

    it('should throw 403 if user does not own the application', async () => {
      mockPrisma.application.findUnique.mockResolvedValue({
        id: 'app-1',
        userId: 'other-user',
      });

      await expect(
        applicationService.getById('app-1', 'user-1'),
      ).rejects.toThrow(AppError);

      try {
        await applicationService.getById('app-1', 'user-1');
      } catch (err) {
        expect((err as AppError).statusCode).toBe(403);
      }
    });
  });

  describe('withdraw', () => {
    it('should withdraw an application', async () => {
      mockPrisma.application.findUnique.mockResolvedValue({
        id: 'app-1',
        userId: 'user-1',
        status: 'SUBMITTED',
      });
      mockPrisma.application.update.mockResolvedValue({
        id: 'app-1',
        status: 'WITHDRAWN',
      });

      const result = await applicationService.withdraw('app-1', 'user-1');
      expect(result.status).toBe('WITHDRAWN');
    });

    it('should throw 404 if application not found', async () => {
      mockPrisma.application.findUnique.mockResolvedValue(null);

      await expect(
        applicationService.withdraw('nonexistent', 'user-1'),
      ).rejects.toThrow(AppError);
    });

    it('should throw 403 if user does not own the application', async () => {
      mockPrisma.application.findUnique.mockResolvedValue({
        id: 'app-1',
        userId: 'other-user',
        status: 'SUBMITTED',
      });

      try {
        await applicationService.withdraw('app-1', 'user-1');
      } catch (err) {
        expect((err as AppError).statusCode).toBe(403);
      }
    });

    it('should throw 400 if application is already withdrawn', async () => {
      mockPrisma.application.findUnique.mockResolvedValue({
        id: 'app-1',
        userId: 'user-1',
        status: 'WITHDRAWN',
      });

      await expect(
        applicationService.withdraw('app-1', 'user-1'),
      ).rejects.toThrow(AppError);

      try {
        await applicationService.withdraw('app-1', 'user-1');
      } catch (err) {
        expect((err as AppError).statusCode).toBe(400);
      }
    });
  });

  describe('getAppliedJobIds', () => {
    it('should return array of job IDs', async () => {
      mockPrisma.application.findMany.mockResolvedValue([
        { jobId: 'job-1' },
        { jobId: 'job-2' },
        { jobId: 'job-3' },
      ]);

      const result = await applicationService.getAppliedJobIds('user-1');
      expect(result).toEqual(['job-1', 'job-2', 'job-3']);
    });

    it('should return empty array when no applications', async () => {
      mockPrisma.application.findMany.mockResolvedValue([]);

      const result = await applicationService.getAppliedJobIds('user-1');
      expect(result).toEqual([]);
    });
  });
});

describe('User Service', () => {
  describe('getById', () => {
    it('should return user by id', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test',
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await userService.getById('user-1');
      expect(result).toEqual(mockUser);
    });

    it('should throw 404 if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(userService.getById('nonexistent')).rejects.toThrow(AppError);

      try {
        await userService.getById('nonexistent');
      } catch (err) {
        expect((err as AppError).statusCode).toBe(404);
      }
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updatedUser = {
        id: 'user-1',
        name: 'Updated Name',
        bio: 'New bio',
      };
      mockPrisma.user.update.mockResolvedValue(updatedUser);

      const result = await userService.updateProfile('user-1', {
        name: 'Updated Name',
        bio: 'New bio',
      });

      expect(result).toEqual(updatedUser);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { name: 'Updated Name', bio: 'New bio' },
        select: expect.any(Object),
      });
    });
  });
});
