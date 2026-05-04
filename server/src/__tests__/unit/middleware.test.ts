import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { validate } from '../../middleware/validate';
import { errorHandler } from '../../middleware/errorHandler';
import { AppError } from '../../utils/AppError';
import { signToken } from '../../utils/jwt';
import { z, ZodError } from 'zod';

function createMockReq(overrides: Partial<Request> = {}): Request {
  return {
    cookies: {},
    body: {},
    query: {},
    params: {},
    ...overrides,
  } as Request;
}

function createMockRes(): Response {
  const res: Partial<Response> = {
    status: vi.fn().mockReturnThis() as any,
    json: vi.fn().mockReturnThis() as any,
  };
  return res as Response;
}

describe('requireAuth middleware', () => {
  let next: NextFunction;

  beforeEach(() => {
    next = vi.fn();
  });

  it('should throw 401 if no token cookie is present', () => {
    const req = createMockReq({ cookies: {} });
    const res = createMockRes();

    expect(() => requireAuth(req, res, next)).toThrow(AppError);
    try {
      requireAuth(req, res, next);
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(401);
      expect((err as AppError).message).toBe('Not authenticated');
    }
  });

  it('should throw 401 if token is invalid', () => {
    const req = createMockReq({ cookies: { token: 'invalid-token' } });
    const res = createMockRes();

    expect(() => requireAuth(req, res, next)).toThrow(AppError);
    try {
      requireAuth(req, res, next);
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(401);
    }
  });

  it('should set req.user and call next() with valid token', () => {
    const token = signToken({ userId: 'user-123' });
    const req = createMockReq({ cookies: { token } });
    const res = createMockRes();

    requireAuth(req, res, next);

    expect(req.user).toEqual({ id: 'user-123' });
    expect(next).toHaveBeenCalled();
  });
});

describe('validate middleware', () => {
  const schema = z.object({
    email: z.string().email(),
    name: z.string().min(1),
  });

  let next: NextFunction;

  beforeEach(() => {
    next = vi.fn();
  });

  it('should call next() when body is valid', () => {
    const req = createMockReq({
      body: { email: 'test@example.com', name: 'John' },
    });
    const res = createMockRes();

    const middleware = validate(schema);
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.body).toEqual({ email: 'test@example.com', name: 'John' });
  });

  it('should throw ZodError when body is invalid', () => {
    const req = createMockReq({
      body: { email: 'not-an-email', name: '' },
    });
    const res = createMockRes();

    const middleware = validate(schema);
    expect(() => middleware(req, res, next)).toThrow();
    expect(next).not.toHaveBeenCalled();
  });
});

describe('errorHandler middleware', () => {
  const next: NextFunction = vi.fn();

  it('should handle ZodError with 400 status', () => {
    const schema = z.object({ email: z.string().email() });
    let zodError: ZodError;
    try {
      schema.parse({ email: 'bad' });
    } catch (err) {
      zodError = err as ZodError;
    }

    const req = createMockReq();
    const res = createMockRes();

    errorHandler(zodError!, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Validation failed',
        details: expect.any(Object),
      }),
    );
  });

  it('should handle AppError with correct status code', () => {
    const err = new AppError(409, 'Email taken', 'EMAIL_TAKEN');
    const req = createMockReq();
    const res = createMockRes();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Email taken',
      code: 'EMAIL_TAKEN',
    });
  });

  it('should handle unknown errors with 500 status', () => {
    const err = new Error('Something went wrong');
    const req = createMockReq();
    const res = createMockRes();

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    consoleSpy.mockRestore();
  });
});
