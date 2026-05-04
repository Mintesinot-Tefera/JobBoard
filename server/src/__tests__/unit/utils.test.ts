import { describe, it, expect } from 'vitest';
import { AppError } from '../../utils/AppError';
import { signToken, verifyToken, COOKIE_NAME, cookieOptions } from '../../utils/jwt';

describe('AppError', () => {
  it('should create an error with statusCode and message', () => {
    const error = new AppError(404, 'Not found');
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Not found');
    expect(error.name).toBe('AppError');
    expect(error.code).toBeUndefined();
  });

  it('should create an error with optional code', () => {
    const error = new AppError(409, 'Email taken', 'EMAIL_TAKEN');
    expect(error.statusCode).toBe(409);
    expect(error.message).toBe('Email taken');
    expect(error.code).toBe('EMAIL_TAKEN');
  });

  it('should be an instance of Error', () => {
    const error = new AppError(500, 'Server error');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
  });
});

describe('JWT Utilities', () => {
  describe('signToken', () => {
    it('should return a string token', () => {
      const token = signToken({ userId: 'user-123' });
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token and return payload', () => {
      const token = signToken({ userId: 'user-456' });
      const payload = verifyToken(token);
      expect(payload.userId).toBe('user-456');
    });

    it('should throw on invalid token', () => {
      expect(() => verifyToken('invalid-token')).toThrow();
    });

    it('should throw on tampered token', () => {
      const token = signToken({ userId: 'user-789' });
      const tamperedToken = token.slice(0, -5) + 'xxxxx';
      expect(() => verifyToken(tamperedToken)).toThrow();
    });
  });

  describe('COOKIE_NAME', () => {
    it('should be "token"', () => {
      expect(COOKIE_NAME).toBe('token');
    });
  });

  describe('cookieOptions', () => {
    it('should have httpOnly set to true', () => {
      expect(cookieOptions.httpOnly).toBe(true);
    });

    it('should have a path of "/"', () => {
      expect(cookieOptions.path).toBe('/');
    });

    it('should have maxAge of 7 days in milliseconds', () => {
      expect(cookieOptions.maxAge).toBe(7 * 24 * 60 * 60 * 1000);
    });
  });
});
