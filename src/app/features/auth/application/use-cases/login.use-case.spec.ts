import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { of, throwError } from 'rxjs';

import { LoginUseCase } from './login.use-case';
import { AuthRepository } from '@features/auth/domain/repositories/auth.repository';
import { User } from '@features/auth/domain/entities/user.entity';
import { LoginCredentialsDto } from '@features/auth/infrastructure/dto/request/login-credentials.dto';

const MOCK_USER = new User('1', 'test@test.com', 'testuser');
const CREDENTIALS: LoginCredentialsDto = { email: 'test@test.com', password: 'password123' };

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let mockAuthRepository: Partial<AuthRepository>;

  beforeEach(() => {
    mockAuthRepository = {
      login: vi.fn().mockReturnValue(of(MOCK_USER)),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
      register: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        LoginUseCase,
        { provide: AuthRepository, useValue: mockAuthRepository },
      ],
    });
    useCase = TestBed.inject(LoginUseCase);
  });

  it('creates the use case', () => {
    expect(useCase).toBeTruthy();
  });

  it('delegates execution to authRepository.login() with the given credentials', () => {
    useCase.execute(CREDENTIALS).subscribe();

    expect(mockAuthRepository.login).toHaveBeenCalledWith(CREDENTIALS);
    expect(mockAuthRepository.login).toHaveBeenCalledOnce();
  });

  it('returns the observable emitted by the repository (no transformation)', () => {
    useCase.execute(CREDENTIALS).subscribe((result) => {
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(MOCK_USER);
      }
    });
  });

  it('returns validation error for empty credentials', () => {
    useCase.execute({ email: '', password: '' }).subscribe((result) => {
      expect(result).toEqual({ success: false, error: { code: 'CREDENTIALS_REQUIRED' } });
    });

    expect(mockAuthRepository.login).not.toHaveBeenCalled();
  });

  it('maps unknown repository failures to NETWORK_ERROR', () => {
    (mockAuthRepository.login as ReturnType<typeof vi.fn>).mockReturnValue(throwError(() => new Error('boom')));

    useCase.execute(CREDENTIALS).subscribe((result) => {
      expect(result).toEqual({ success: false, error: { code: 'NETWORK_ERROR' } });
    });
  });

  it('does not call any other repository method', () => {
    useCase.execute(CREDENTIALS).subscribe();

    expect(mockAuthRepository.logout).not.toHaveBeenCalled();
    expect(mockAuthRepository.getCurrentUser).not.toHaveBeenCalled();
    expect(mockAuthRepository.register).not.toHaveBeenCalled();
  });
});
