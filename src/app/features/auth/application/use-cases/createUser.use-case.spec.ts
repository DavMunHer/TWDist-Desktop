import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { CreateUserUseCase } from './createUser.use-case';
import { AuthRepository } from '@features/auth/domain/repositories/auth.repository';
import { RegisterCredentialsDto } from '@features/auth/infrastructure/dto/request/register-credentials.dto';
import { User } from '@features/auth/domain/entities/user.entity';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let authRepositoryMock: Partial<AuthRepository>;

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
  };

  const dto: RegisterCredentialsDto = {
    email: 'test@example.com',
    password: 'password123',
    username: 'testuser',
  };

  beforeEach(() => {
    authRepositoryMock = {
      register: vi.fn().mockReturnValue(of(mockUser)),
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        CreateUserUseCase,
        { provide: AuthRepository, useValue: authRepositoryMock },
      ],
    });

    useCase = TestBed.inject(CreateUserUseCase);
  });

  it('creates the use case', () => {
    expect(useCase).toBeTruthy();
  });

  it('delegates execution to authRepository.register() with the given credentials', () => {
    useCase.execute(dto);
    expect(authRepositoryMock.register).toHaveBeenCalledWith(dto);
  });

  it('returns success result emitted by the repository', () => {
    useCase.execute(dto).subscribe((result) => {
      expect(result).toEqual({ success: true, value: mockUser });
    });
  });

  it('returns validation error for missing credentials', () => {
    useCase.execute({ ...dto, email: '' }).subscribe((result) => {
      expect(result).toEqual({ success: false, error: { code: 'CREDENTIALS_REQUIRED' } });
    });

    expect(authRepositoryMock.register).not.toHaveBeenCalled();
  });

  it('returns validation error for malformed email', () => {
    useCase.execute({ ...dto, email: 'bad-email' }).subscribe((result) => {
      expect(result).toEqual({ success: false, error: { code: 'INVALID_EMAIL_FORMAT' } });
    });

    expect(authRepositoryMock.register).not.toHaveBeenCalled();
  });

  it('returns validation error for short password', () => {
    useCase.execute({ ...dto, password: 'ab' }).subscribe((result) => {
      expect(result).toEqual({ success: false, error: { code: 'PASSWORD_TOO_SHORT' } });
    });

    expect(authRepositoryMock.register).not.toHaveBeenCalled();
  });

  it('returns validation error for blank username', () => {
    useCase.execute({ ...dto, username: '   ' }).subscribe((result) => {
      expect(result).toEqual({ success: false, error: { code: 'USERNAME_REQUIRED' } });
    });

    expect(authRepositoryMock.register).not.toHaveBeenCalled();
  });

  it('maps unknown repository failures to NETWORK_ERROR', () => {
    (authRepositoryMock.register as ReturnType<typeof vi.fn>).mockReturnValue(throwError(() => new Error('boom')));

    useCase.execute(dto).subscribe((result) => {
      expect(result).toEqual({ success: false, error: { code: 'NETWORK_ERROR' } });
    });
  });
});
