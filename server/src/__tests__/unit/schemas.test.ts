import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema } from '../../modules/auth/auth.schema';
import { createJobSchema, jobListQuerySchema } from '../../modules/job/job.schema';
import { createApplicationSchema } from '../../modules/application/application.schema';
import { updateProfileSchema } from '../../modules/user/user.schema';

describe('Auth Schemas', () => {
  describe('registerSchema', () => {
    it('should accept valid registration input', () => {
      const result = registerSchema.safeParse({
        email: 'user@example.com',
        password: 'password123',
        name: 'John Doe',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
        expect(result.data.name).toBe('John Doe');
      }
    });

    it('should trim and lowercase email', () => {
      const result = registerSchema.safeParse({
        email: '  User@Example.COM  ',
        password: 'password123',
        name: 'John',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
      }
    });

    it('should reject invalid email', () => {
      const result = registerSchema.safeParse({
        email: 'not-an-email',
        password: 'password123',
        name: 'John',
      });
      expect(result.success).toBe(false);
    });

    it('should reject short password (less than 8 chars)', () => {
      const result = registerSchema.safeParse({
        email: 'user@example.com',
        password: 'short',
        name: 'John',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty name', () => {
      const result = registerSchema.safeParse({
        email: 'user@example.com',
        password: 'password123',
        name: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject name exceeding 100 characters', () => {
      const result = registerSchema.safeParse({
        email: 'user@example.com',
        password: 'password123',
        name: 'a'.repeat(101),
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing fields', () => {
      const result = registerSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should accept valid login input', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty password', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid email format', () => {
      const result = loginSchema.safeParse({
        email: 'bad-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('Job Schemas', () => {
  describe('createJobSchema', () => {
    const validJob = {
      title: 'Software Engineer',
      description: 'Build amazing things',
      category: 'ENGINEERING',
      companyName: 'Acme Inc',
      location: 'Remote',
      employmentType: 'FULL_TIME',
      deadline: '2026-12-31T00:00:00.000Z',
    };

    it('should accept valid job input', () => {
      const result = createJobSchema.safeParse(validJob);
      expect(result.success).toBe(true);
    });

    it('should accept job with optional salary range', () => {
      const result = createJobSchema.safeParse({
        ...validJob,
        salaryMin: 50000,
        salaryMax: 100000,
      });
      expect(result.success).toBe(true);
    });

    it('should reject when salaryMin exceeds salaryMax', () => {
      const result = createJobSchema.safeParse({
        ...validJob,
        salaryMin: 100000,
        salaryMax: 50000,
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty title', () => {
      const result = createJobSchema.safeParse({
        ...validJob,
        title: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid category', () => {
      const result = createJobSchema.safeParse({
        ...validJob,
        category: 'INVALID_CATEGORY',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid employment type', () => {
      const result = createJobSchema.safeParse({
        ...validJob,
        employmentType: 'INVALID_TYPE',
      });
      expect(result.success).toBe(false);
    });

    it('should accept all valid categories', () => {
      const categories = [
        'ENGINEERING', 'DESIGN', 'MARKETING', 'SALES', 'FINANCE',
        'HR', 'OPERATIONS', 'PRODUCT', 'DATA', 'OTHER',
      ];
      for (const category of categories) {
        const result = createJobSchema.safeParse({ ...validJob, category });
        expect(result.success).toBe(true);
      }
    });

    it('should accept all valid employment types', () => {
      const types = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'];
      for (const employmentType of types) {
        const result = createJobSchema.safeParse({ ...validJob, employmentType });
        expect(result.success).toBe(true);
      }
    });

    it('should reject title exceeding 200 characters', () => {
      const result = createJobSchema.safeParse({
        ...validJob,
        title: 'a'.repeat(201),
      });
      expect(result.success).toBe(false);
    });

    it('should accept optional companyLogo URL', () => {
      const result = createJobSchema.safeParse({
        ...validJob,
        companyLogo: 'https://example.com/logo.png',
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty string for companyLogo', () => {
      const result = createJobSchema.safeParse({
        ...validJob,
        companyLogo: '',
      });
      expect(result.success).toBe(true);
    });

    it('should coerce deadline string to Date', () => {
      const result = createJobSchema.safeParse(validJob);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.deadline).toBeInstanceOf(Date);
      }
    });
  });

  describe('jobListQuerySchema', () => {
    it('should accept valid category filter', () => {
      const result = jobListQuerySchema.safeParse({ category: 'ENGINEERING' });
      expect(result.success).toBe(true);
    });

    it('should accept empty query (no category)', () => {
      const result = jobListQuerySchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should reject invalid category', () => {
      const result = jobListQuerySchema.safeParse({ category: 'INVALID' });
      expect(result.success).toBe(false);
    });
  });
});

describe('Application Schema', () => {
  describe('createApplicationSchema', () => {
    it('should accept empty input (cover letter is optional)', () => {
      const result = createApplicationSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should accept valid cover letter', () => {
      const result = createApplicationSchema.safeParse({
        coverLetter: 'I am very interested in this role.',
      });
      expect(result.success).toBe(true);
    });

    it('should reject cover letter exceeding 5000 characters', () => {
      const result = createApplicationSchema.safeParse({
        coverLetter: 'a'.repeat(5001),
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('User Schema', () => {
  describe('updateProfileSchema', () => {
    it('should accept partial update with name only', () => {
      const result = updateProfileSchema.safeParse({ name: 'New Name' });
      expect(result.success).toBe(true);
    });

    it('should accept full profile update', () => {
      const result = updateProfileSchema.safeParse({
        name: 'John Doe',
        bio: 'Software developer',
        headline: 'Senior Engineer',
        location: 'NYC',
        website: 'https://johndoe.com',
      });
      expect(result.success).toBe(true);
    });

    it('should convert empty strings to null for nullable fields', () => {
      const result = updateProfileSchema.safeParse({
        bio: '',
        headline: '',
        location: '',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.bio).toBeNull();
        expect(result.data.headline).toBeNull();
        expect(result.data.location).toBeNull();
      }
    });

    it('should accept empty object (all fields optional)', () => {
      const result = updateProfileSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should reject invalid website URL', () => {
      const result = updateProfileSchema.safeParse({
        website: 'not-a-url',
      });
      expect(result.success).toBe(false);
    });

    it('should reject name exceeding 100 characters', () => {
      const result = updateProfileSchema.safeParse({
        name: 'a'.repeat(101),
      });
      expect(result.success).toBe(false);
    });

    it('should reject bio exceeding 2000 characters', () => {
      const result = updateProfileSchema.safeParse({
        bio: 'a'.repeat(2001),
      });
      expect(result.success).toBe(false);
    });
  });
});
