import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { RefreshSessionUseCase } from './refresh-session.use-case';
import { AuthRepository } from '@features/auth/domain/repositories/auth.repository';

describe('RefreshSessionUseCase', () => {
  let useCase: RefreshSessionUseCase;
  let authRepositoryMock: Partial<AuthRepository>;

  beforeEach(() => {
    authRepositoryMock = {
      refresh: vi.fn().mockReturnValue(of(void 0)),
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        RefreshSessionUseCase,
        { provide: AuthRepository, useValue: authRepositoryMock },
      ],
    });

    useCase = TestBed.inject(RefreshSessionUseCase);
  });

  it('creates the use case', () => {
    expect(useCase).toBeTruthy();
  });

  it('delegates execution to authRepository.refresh()', () => {
    useCase.execute();

    expect(authRepositoryMock.refresh).toHaveBeenCalled();
  });

  it('returns the observable emitted by the repository', () => {
    useCase.execute().subscribe((result) => {
      expect(result).toBeUndefined();
    });
  });
});
