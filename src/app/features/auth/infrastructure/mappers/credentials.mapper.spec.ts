import { describe, it, expect } from 'vitest';
import { CredentialsMapper } from './credentials.mapper';
import { Credentials } from '@features/auth/domain/value-objects/credentials.value-object';
import { LoginCredentialsDto } from '@features/auth/infrastructure/dto/request/login-credentials.dto';

describe('CredentialsMapper', () => {
  describe('toDomain()', () => {
    it('maps a LoginCredentialsDto to a Credentials value object', () => {
      const dto: LoginCredentialsDto = { email: 'test@test.com', password: 'password123' };

      const creds = CredentialsMapper.toDomain(dto);

      expect(creds).toBeInstanceOf(Credentials);
      expect(creds.email).toBe('test@test.com');
      expect(creds.password).toBe('password123');
    });

    it('throws if the DTO has an empty email (propagates VO validation)', () => {
      const dto: LoginCredentialsDto = { email: '', password: 'password123' };

      expect(() => CredentialsMapper.toDomain(dto)).toThrow(
        'Email and password are required'
      );
    });

    it('throws if the DTO has an empty password (propagates VO validation)', () => {
      const dto: LoginCredentialsDto = { email: 'test@test.com', password: '' };

      expect(() => CredentialsMapper.toDomain(dto)).toThrow(
        'Email and password are required'
      );
    });
  });

  describe('toDto()', () => {
    it('maps a Credentials VO back to a LoginCredentialsDto', () => {
      const creds = new Credentials('test@test.com', 'password123');

      const dto = CredentialsMapper.toDto(creds);

      expect(dto.email).toBe('test@test.com');
      expect(dto.password).toBe('password123');
    });

    it('round-trips correctly: toDomain → toDto preserves values', () => {
      const original: LoginCredentialsDto = { email: 'round@trip.com', password: 'roundtrip1' };

      const dto = CredentialsMapper.toDto(CredentialsMapper.toDomain(original));

      expect(dto).toEqual(original);
    });
  });
});
