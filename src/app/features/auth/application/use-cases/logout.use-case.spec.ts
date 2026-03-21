import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { LogoutUseCase } from './logout.use-case';
import { AuthRepository } from '@features/auth/domain/repositories/auth.repository';

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;
  let authRepositoryMock: Partial<AuthRepository>;

  beforeEach(() => {
    authRepositoryMock = {
      logout: vi.fn().mockReturnValue(of(void 0)),
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        LogoutUseCase,
        { provide: AuthRepository, useValue: authRepositoryMock },
      ],
    });

    useCase = TestBed.inject(LogoutUseCase);
  });

  it('creates the use case', () => {
    expect(useCase).toBeTruthy();
  });

  it('delegates execution to authRepository.logout()', () => {
    useCase.execute();
    expect(authRepositoryMock.logout).toHaveBeenCalled();
  });

  it('returns the observable emitted by the repository', () => {
    useCase.execute().subscribe((result) => {
      expect(result).toBeUndefined();
    });
  });
});
