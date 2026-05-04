import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { prisma } from '../../lib/prisma';
import { signToken } from '../../utils/jwt';

const app = createApp();

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

const authCookie = (userId: string) => {
  const token = signToken({ userId });
  return `token=${token}`;
};

// ─── Health Check ──────────────────────────────────────────────────────────
describe('GET /api/health', () => {
  it('should return { ok: true }', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});

// ─── Auth Routes ───────────────────────────────────────────────────────────
describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user and set cookie', async () => {
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

      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'password123', name: 'Test User' });

      expect(res.status).toBe(201);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.id).toBe('user-1');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should return 400 for invalid input', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'bad', password: '123', name: '' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('should return 409 for duplicate email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'taken@example.com', password: 'password123', name: 'Test' });

      expect(res.status).toBe(409);
      expect(res.body.code).toBe('EMAIL_TAKEN');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
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

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should return 401 for invalid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'password123' });

      expect(res.status).toBe(401);
    });

    it('should return 400 for missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear the auth cookie and return 204', async () => {
      const res = await request(app).post('/api/auth/logout');

      expect(res.status).toBe(204);
      expect(res.headers['set-cookie']).toBeDefined();
    });
  });
});

// ─── User Routes ───────────────────────────────────────────────────────────
describe('User API', () => {
  describe('GET /api/users/me', () => {
    it('should return the authenticated user', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test',
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const res = await request(app)
        .get('/api/users/me')
        .set('Cookie', authCookie('user-1'));

      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.id).toBe('user-1');
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/users/me');
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/users/me', () => {
    it('should update user profile', async () => {
      const updatedUser = {
        id: 'user-1',
        name: 'Updated Name',
        bio: 'New bio',
      };
      mockPrisma.user.update.mockResolvedValue(updatedUser);

      const res = await request(app)
        .patch('/api/users/me')
        .set('Cookie', authCookie('user-1'))
        .send({ name: 'Updated Name', bio: 'New bio' });

      expect(res.status).toBe(200);
      expect(res.body.user.name).toBe('Updated Name');
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .patch('/api/users/me')
        .send({ name: 'Test' });

      expect(res.status).toBe(401);
    });

    it('should return 400 for invalid website URL', async () => {
      const res = await request(app)
        .patch('/api/users/me')
        .set('Cookie', authCookie('user-1'))
        .send({ website: 'not-a-url' });

      expect(res.status).toBe(400);
    });
  });
});

// ─── Job Routes ────────────────────────────────────────────────────────────
describe('Job API', () => {
  describe('GET /api/jobs', () => {
    it('should return all jobs', async () => {
      const mockJobs = [
        { id: 'job-1', title: 'Engineer' },
        { id: 'job-2', title: 'Designer' },
      ];
      mockPrisma.job.findMany.mockResolvedValue(mockJobs);

      const res = await request(app).get('/api/jobs');

      expect(res.status).toBe(200);
      expect(res.body.jobs).toHaveLength(2);
    });

    it('should filter jobs by category', async () => {
      mockPrisma.job.findMany.mockResolvedValue([]);

      const res = await request(app).get('/api/jobs?category=ENGINEERING');

      expect(res.status).toBe(200);
      expect(mockPrisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { category: 'ENGINEERING' },
        }),
      );
    });

    it('should not require authentication', async () => {
      mockPrisma.job.findMany.mockResolvedValue([]);
      const res = await request(app).get('/api/jobs');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/jobs/:id', () => {
    it('should return a single job', async () => {
      const mockJob = { id: 'job-1', title: 'Engineer' };
      mockPrisma.job.findUnique.mockResolvedValue(mockJob);

      const res = await request(app).get('/api/jobs/job-1');

      expect(res.status).toBe(200);
      expect(res.body.job.id).toBe('job-1');
    });

    it('should return 404 for non-existent job', async () => {
      mockPrisma.job.findUnique.mockResolvedValue(null);

      const res = await request(app).get('/api/jobs/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/jobs', () => {
    const validJob = {
      title: 'Software Engineer',
      description: 'Build amazing things',
      category: 'ENGINEERING',
      companyName: 'Acme Inc',
      location: 'Remote',
      employmentType: 'FULL_TIME',
      deadline: '2026-12-31T00:00:00.000Z',
    };

    it('should create a job when authenticated', async () => {
      const mockJob = { id: 'job-1', ...validJob };
      mockPrisma.job.create.mockResolvedValue(mockJob);

      const res = await request(app)
        .post('/api/jobs')
        .set('Cookie', authCookie('user-1'))
        .send(validJob);

      expect(res.status).toBe(201);
      expect(res.body.job).toBeDefined();
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .send(validJob);

      expect(res.status).toBe(401);
    });

    it('should return 400 for invalid job data', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .set('Cookie', authCookie('user-1'))
        .send({ title: '' });

      expect(res.status).toBe(400);
    });

    it('should return 400 when salaryMin exceeds salaryMax', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .set('Cookie', authCookie('user-1'))
        .send({ ...validJob, salaryMin: 100000, salaryMax: 50000 });

      expect(res.status).toBe(400);
    });
  });
});

// ─── Application Routes ────────────────────────────────────────────────────
describe('Application API', () => {
  describe('POST /api/applications/jobs/:jobId', () => {
    it('should create an application when authenticated', async () => {
      mockPrisma.job.findUnique.mockResolvedValue({ id: 'job-1' });
      mockPrisma.application.findUnique.mockResolvedValue(null);
      mockPrisma.application.create.mockResolvedValue({
        id: 'app-1',
        coverLetter: 'I want this job',
        status: 'SUBMITTED',
      });

      const res = await request(app)
        .post('/api/applications/jobs/job-1')
        .set('Cookie', authCookie('user-1'))
        .send({ coverLetter: 'I want this job' });

      expect(res.status).toBe(201);
      expect(res.body.application).toBeDefined();
      expect(res.body.application.status).toBe('SUBMITTED');
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/applications/jobs/job-1')
        .send({});

      expect(res.status).toBe(401);
    });

    it('should return 404 when job does not exist', async () => {
      mockPrisma.job.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/applications/jobs/nonexistent')
        .set('Cookie', authCookie('user-1'))
        .send({});

      expect(res.status).toBe(404);
    });

    it('should return 409 for duplicate application', async () => {
      mockPrisma.job.findUnique.mockResolvedValue({ id: 'job-1' });
      mockPrisma.application.findUnique.mockResolvedValue({ id: 'existing' });

      const res = await request(app)
        .post('/api/applications/jobs/job-1')
        .set('Cookie', authCookie('user-1'))
        .send({});

      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/applications/me', () => {
    it('should return user applications', async () => {
      mockPrisma.application.findMany.mockResolvedValue([
        { id: 'app-1', status: 'SUBMITTED' },
        { id: 'app-2', status: 'IN_REVIEW' },
      ]);

      const res = await request(app)
        .get('/api/applications/me')
        .set('Cookie', authCookie('user-1'));

      expect(res.status).toBe(200);
      expect(res.body.applications).toHaveLength(2);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/applications/me');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/applications/me/job-ids', () => {
    it('should return array of applied job IDs', async () => {
      mockPrisma.application.findMany.mockResolvedValue([
        { jobId: 'job-1' },
        { jobId: 'job-2' },
      ]);

      const res = await request(app)
        .get('/api/applications/me/job-ids')
        .set('Cookie', authCookie('user-1'));

      expect(res.status).toBe(200);
      expect(res.body.jobIds).toEqual(['job-1', 'job-2']);
    });
  });

  describe('GET /api/applications/:id', () => {
    it('should return a specific application owned by user', async () => {
      mockPrisma.application.findUnique.mockResolvedValue({
        id: 'app-1',
        userId: 'user-1',
        status: 'SUBMITTED',
      });

      const res = await request(app)
        .get('/api/applications/app-1')
        .set('Cookie', authCookie('user-1'));

      expect(res.status).toBe(200);
      expect(res.body.application.id).toBe('app-1');
    });

    it('should return 403 when accessing another user application', async () => {
      mockPrisma.application.findUnique.mockResolvedValue({
        id: 'app-1',
        userId: 'other-user',
        status: 'SUBMITTED',
      });

      const res = await request(app)
        .get('/api/applications/app-1')
        .set('Cookie', authCookie('user-1'));

      expect(res.status).toBe(403);
    });

    it('should return 404 for non-existent application', async () => {
      mockPrisma.application.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/applications/nonexistent')
        .set('Cookie', authCookie('user-1'));

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/applications/:id/withdraw', () => {
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

      const res = await request(app)
        .patch('/api/applications/app-1/withdraw')
        .set('Cookie', authCookie('user-1'));

      expect(res.status).toBe(200);
      expect(res.body.application.status).toBe('WITHDRAWN');
    });

    it('should return 400 for already withdrawn application', async () => {
      mockPrisma.application.findUnique.mockResolvedValue({
        id: 'app-1',
        userId: 'user-1',
        status: 'WITHDRAWN',
      });

      const res = await request(app)
        .patch('/api/applications/app-1/withdraw')
        .set('Cookie', authCookie('user-1'));

      expect(res.status).toBe(400);
    });

    it('should return 403 when withdrawing another user application', async () => {
      mockPrisma.application.findUnique.mockResolvedValue({
        id: 'app-1',
        userId: 'other-user',
        status: 'SUBMITTED',
      });

      const res = await request(app)
        .patch('/api/applications/app-1/withdraw')
        .set('Cookie', authCookie('user-1'));

      expect(res.status).toBe(403);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app).patch('/api/applications/app-1/withdraw');
      expect(res.status).toBe(401);
    });
  });
});
