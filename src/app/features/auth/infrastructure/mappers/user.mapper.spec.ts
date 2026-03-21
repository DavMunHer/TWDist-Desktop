import { describe, it, expect } from 'vitest';
import { UserMapper } from './user.mapper';
import { User } from '@features/auth/domain/entities/user.entity';
import { UserResponseDto } from '@features/auth/infrastructure/dto/response/user-response.dto';

describe('UserMapper', () => {
  describe('toDomain()', () => {
    it('maps a UserResponseDto to a User domain entity', () => {
      const dto: UserResponseDto = { id: 1, email: 'test@test.com', username: 'testuser' };

      const user = UserMapper.toDomain(dto);

      expect(user).toBeInstanceOf(User);
      expect(user.email).toBe('test@test.com');
      expect(user.username).toBe('testuser');
    });

    it('coerces the numeric id to a string', () => {
      const dto: UserResponseDto = { id: 42, email: 'a@b.com', username: 'u' };

      expect(UserMapper.toDomain(dto).id).toBe('42');
    });

    it('preserves all fields without loss', () => {
      const dto: UserResponseDto = { id: 99, email: 'full@test.com', username: 'fulluser' };

      const user = UserMapper.toDomain(dto);

      expect(user.id).toBe('99');
      expect(user.email).toBe('full@test.com');
      expect(user.username).toBe('fulluser');
    });
  });

  describe('toDto()', () => {
    it('maps a User back to a RegisterCredentialsDto', () => {
      const user = new User('1', 'test@test.com', 'testuser');

      const dto = UserMapper.toDto(user);

      expect(dto.email).toBe('test@test.com');
      expect(dto.username).toBe('testuser');
    });

    // NOTE: This test explicitly documents a design decision in the mapper:
    // password is intentionally not stored in the User entity, so toDto() fills it with ''.
    it('sets password to an empty string because User does not store it', () => {
      const user = new User('1', 'test@test.com', 'testuser');

      expect(UserMapper.toDto(user).password).toBe('');
    });
  });
});
