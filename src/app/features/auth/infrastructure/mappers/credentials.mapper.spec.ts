import { describe, it, expect } from 'vitest';
import { CredentialsMapper } from './credentials.mapper';
import { Credentials } from '@features/auth/domain/value-objects/credentials.value-object';
import { LoginCredentialsDto } from '@features/auth/infrastructure/dto/request/login-credentials.dto';

describe('CredentialsMapper', () => {
  describe('toDomain()', () => {
    it('maps a LoginCredentialsDto to a Credentials value object', () => {
      const dto: LoginCredentialsDto = { email: 'test@test.com', password: 'password123' };

      const result = CredentialsMapper.toDomain(dto);
      expect(result.success).toBe(true);
      if (!result.success) {
        throw new Error('Expected success result');
      }

      expect(result.value).toBeInstanceOf(Credentials);
      expect(result.value.email).toBe('test@test.com');
      expect(result.value.password).toBe('password123');
    });

    it('returns error if the DTO has an empty email', () => {
      const dto: LoginCredentialsDto = { email: '', password: 'password123' };

      expect(CredentialsMapper.toDomain(dto)).toEqual({
        success: false,
        error: { code: 'CREDENTIALS_REQUIRED' },
      });
    });

    it('returns error if the DTO has an empty password', () => {
      const dto: LoginCredentialsDto = { email: 'test@test.com', password: '' };

      expect(CredentialsMapper.toDomain(dto)).toEqual({
        success: false,
        error: { code: 'CREDENTIALS_REQUIRED' },
      });
    });
  });

  describe('toDto()', () => {
    it('maps a Credentials VO back to a LoginCredentialsDto', () => {
      const credsResult = Credentials.tryCreate('test@test.com', 'password123');
      expect(credsResult.success).toBe(true);
      if (!credsResult.success) {
        throw new Error('Expected success result');
      }

      const dto = CredentialsMapper.toDto(credsResult.value);

      expect(dto.email).toBe('test@test.com');
      expect(dto.password).toBe('password123');
    });

    it('round-trips correctly: toDomain → toDto preserves values', () => {
      const original: LoginCredentialsDto = { email: 'round@trip.com', password: 'roundtrip1' };

      const result = CredentialsMapper.toDomain(original);
      expect(result.success).toBe(true);
      if (!result.success) {
        throw new Error('Expected success result');
      }

      const dto = CredentialsMapper.toDto(result.value);

      expect(dto).toEqual(original);
    });
  });
});
