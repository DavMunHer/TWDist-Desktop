import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { GetCurrentUserUseCase } from './getCurrentUser.use-case';
import { AuthRepository } from '@features/auth/domain/repositories/auth.repository';
import { User } from '@features/auth/domain/entities/user.entity';

describe('GetCurrentUserUseCase', () => {
  let useCase: GetCurrentUserUseCase;
  let authRepositoryMock: Partial<AuthRepository>;

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
  };

  beforeEach(() => {
    authRepositoryMock = {
      getCurrentUser: vi.fn().mockReturnValue(of(mockUser)),
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        GetCurrentUserUseCase,
        { provide: AuthRepository, useValue: authRepositoryMock },
      ],
    });

    useCase = TestBed.inject(GetCurrentUserUseCase);
  });

  it('creates the use case', () => {
    expect(useCase).toBeTruthy();
  });

  it('delegates execution to authRepository.getCurrentUser()', () => {
    useCase.execute();
    expect(authRepositoryMock.getCurrentUser).toHaveBeenCalled();
  });

  it('returns the observable emitted by the repository', () => {
    useCase.execute().subscribe((result) => {
      expect(result).toEqual(mockUser);
    });
  });
});
