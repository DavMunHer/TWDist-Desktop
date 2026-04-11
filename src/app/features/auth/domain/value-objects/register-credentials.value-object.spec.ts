import { describe, it, expect } from 'vitest';
import { RegisterCredentials } from './register-credentials.value-object';

describe('RegisterCredentials', () => {
  describe('tryCreate()', () => {
    it('creates a RegisterCredentials result with valid email, password and username', () => {
      const result = RegisterCredentials.tryCreate('user@example.com', 'password123', 'john');
      expect(result.success).toBe(true);
      if (!result.success) {
        throw new Error('Expected success result');
      }

      expect(result.value.email).toBe('user@example.com');
      expect(result.value.password).toBe('password123');
      expect(result.value.username).toBe('john');
    });

    it('returns CREDENTIALS_REQUIRED when email is empty', () => {
      expect(RegisterCredentials.tryCreate('', 'password123', 'john')).toEqual({
        success: false,
        error: { code: 'CREDENTIALS_REQUIRED' },
      });
    });

    it('returns INVALID_EMAIL_FORMAT for malformed email', () => {
      expect(RegisterCredentials.tryCreate('bad-email', 'password123', 'john')).toEqual({
        success: false,
        error: { code: 'INVALID_EMAIL_FORMAT' },
      });
    });

    it('returns PASSWORD_TOO_SHORT for short password', () => {
      expect(RegisterCredentials.tryCreate('user@example.com', 'ab', 'john')).toEqual({
        success: false,
        error: { code: 'PASSWORD_TOO_SHORT' },
      });
    });

    it('returns USERNAME_REQUIRED when username is empty', () => {
      expect(RegisterCredentials.tryCreate('user@example.com', 'password123', '   ')).toEqual({
        success: false,
        error: { code: 'USERNAME_REQUIRED' },
      });
    });

    it('returns USERNAME_TOO_SHORT when username has less than 3 characters', () => {
      expect(RegisterCredentials.tryCreate('user@example.com', 'password123', 'ab')).toEqual({
        success: false,
        error: { code: 'USERNAME_TOO_SHORT' },
      });
    });

    it('trims values before creating domain object', () => {
      const result = RegisterCredentials.tryCreate(
        '  user@example.com  ',
        '  password123  ',
        '  john  '
      );

      expect(result.success).toBe(true);
      if (!result.success) {
        throw new Error('Expected success result');
      }

      expect(result.value.email).toBe('user@example.com');
      expect(result.value.password).toBe('password123');
      expect(result.value.username).toBe('john');
    });
  });
});
