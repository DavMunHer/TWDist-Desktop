import { describe, it, expect } from 'vitest';
import { Credentials } from './credentials.value-object';

describe('Credentials', () => {
  describe('tryCreate()', () => {
    it('creates a Credentials result with valid email and password', () => {
      const result = Credentials.tryCreate('user@example.com', 'password123');
      expect(result.success).toBe(true);
      if (!result.success) {
        throw new Error('Expected success result');
      }

      expect(result.value.email).toBe('user@example.com');
      expect(result.value.password).toBe('password123');
    });

    it('returns CREDENTIALS_REQUIRED when email is empty', () => {
      expect(Credentials.tryCreate('', 'password123')).toEqual({
        success: false,
        error: { code: 'CREDENTIALS_REQUIRED' },
      });
    });

    it('returns CREDENTIALS_REQUIRED when password is empty', () => {
      expect(Credentials.tryCreate('user@example.com', '')).toEqual({
        success: false,
        error: { code: 'CREDENTIALS_REQUIRED' },
      });
    });

    it('returns CREDENTIALS_REQUIRED when both values are empty', () => {
      expect(Credentials.tryCreate('', '')).toEqual({
        success: false,
        error: { code: 'CREDENTIALS_REQUIRED' },
      });
    });

    it('returns INVALID_EMAIL_FORMAT when email is not valid', () => {
      expect(Credentials.tryCreate('not-an-email', 'password123')).toEqual({
        success: false,
        error: { code: 'INVALID_EMAIL_FORMAT' },
      });
    });

    it('returns PASSWORD_TOO_SHORT when password has less than 3 characters', () => {
      expect(Credentials.tryCreate('user@example.com', 'ab')).toEqual({
        success: false,
        error: { code: 'PASSWORD_TOO_SHORT' },
      });
    });
  });
});
