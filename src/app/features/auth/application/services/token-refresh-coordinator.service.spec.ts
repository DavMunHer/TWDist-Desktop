import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TokenRefreshCoordinator } from './token-refresh-coordinator.service';
import { RefreshSessionUseCase } from '@features/auth/application/use-cases/refresh-session.use-case';
import { AuthStore } from '@features/auth/presentation/store/auth.store';

describe('TokenRefreshCoordinator', () => {
  let coordinator: TokenRefreshCoordinator;
  let refreshSessionUseCaseMock: { execute: ReturnType<typeof vi.fn> };
  let authStoreMock: { clearSessionState: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    refreshSessionUseCaseMock = {
      execute: vi.fn(),
    };
    authStoreMock = {
      clearSessionState: vi.fn(),
    };
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        TokenRefreshCoordinator,
        { provide: RefreshSessionUseCase, useValue: refreshSessionUseCaseMock },
        { provide: AuthStore, useValue: authStoreMock },
        { provide: Router, useValue: { url: '/projects/upcoming', navigate: vi.fn() } },
      ],
    });

    coordinator = TestBed.inject(TokenRefreshCoordinator);
  });

  it('starts idle', () => {
    expect(coordinator.state.value).toBe('idle');
  });

  it('moves to refreshing while the refresh request is in flight', () => {
    const pendingRefresh$ = new Subject<void>();
    refreshSessionUseCaseMock.execute.mockReturnValue(pendingRefresh$.asObservable());

    coordinator.runRefresh().subscribe();

    expect(coordinator.state.value).toBe('refreshing');
  });

  it('returns to idle and marks the session authenticated on success', () => {
    const pendingRefresh$ = new Subject<void>();
    refreshSessionUseCaseMock.execute.mockReturnValue(pendingRefresh$.asObservable());

    coordinator.runRefresh().subscribe();
    pendingRefresh$.next();
    pendingRefresh$.complete();

    expect(coordinator.state.value).toBe('idle');
    expect(localStorage.getItem('has_session')).toBe('true');
  });

  it('shares one in-flight refresh across concurrent callers', () => {
    const pendingRefresh$ = new Subject<void>();
    const completions: string[] = [];
    refreshSessionUseCaseMock.execute.mockReturnValue(pendingRefresh$.asObservable());

    coordinator.runRefresh().subscribe(() => completions.push('first'));
    coordinator.runRefresh().subscribe(() => completions.push('second'));

    expect(refreshSessionUseCaseMock.execute).toHaveBeenCalledOnce();

    pendingRefresh$.next();
    pendingRefresh$.complete();

    expect(completions).toEqual(['first', 'second']);
  });

  it('clears local session state and exposes the error when refresh fails', () => {
    const refreshError = new Error('refresh failed');
    let emittedError: unknown;
    localStorage.setItem('has_session', 'true');
    refreshSessionUseCaseMock.execute.mockReturnValue(throwError(() => refreshError));

    coordinator.runRefresh().subscribe({ error: (error: unknown) => (emittedError = error) });

    expect(emittedError).toBe(refreshError);
    expect(localStorage.getItem('has_session')).toBeNull();
    expect(authStoreMock.clearSessionState).toHaveBeenCalledOnce();
    expect(coordinator.state.value).toEqual({ error: refreshError });
  });

  it('allows a new refresh after a previous failure has completed', () => {
    localStorage.setItem('has_session', 'true');
    refreshSessionUseCaseMock.execute
      .mockReturnValueOnce(throwError(() => new Error('first failure')))
      .mockReturnValueOnce(new Subject<void>().asObservable());

    coordinator.runRefresh().subscribe({ error: () => undefined });
    localStorage.setItem('has_session', 'true');
    coordinator.runRefresh().subscribe();

    expect(refreshSessionUseCaseMock.execute).toHaveBeenCalledTimes(2);
    expect(coordinator.state.value).toBe('refreshing');
  });

  it('does not start another refresh after a terminal refresh failure clears the session hint', () => {
    const refreshError = new Error('refresh failed');
    const secondError: unknown[] = [];
    localStorage.setItem('has_session', 'true');
    refreshSessionUseCaseMock.execute.mockReturnValue(throwError(() => refreshError));

    coordinator.runRefresh().subscribe({ error: () => undefined });
    coordinator.runRefresh().subscribe({ error: (error: unknown) => secondError.push(error) });

    expect(refreshSessionUseCaseMock.execute).toHaveBeenCalledOnce();
    expect(secondError).toEqual([refreshError]);
  });
});
