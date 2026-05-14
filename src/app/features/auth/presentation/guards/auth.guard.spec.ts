import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { signal, provideZonelessChangeDetection } from '@angular/core';

import { authGuard } from './auth.guard';
import { AuthStore } from '@features/auth/presentation/store/auth.store';

describe('authGuard', () => {
  let isAuthenticatedSignal: ReturnType<typeof signal<boolean>>;
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };

  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = {} as RouterStateSnapshot;

  const runGuard = () =>
    TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

  beforeEach(() => {
    isAuthenticatedSignal = signal<boolean>(false);
    mockRouter = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthStore, useValue: { isAuthenticated: isAuthenticatedSignal } },
        { provide: Router, useValue: mockRouter },
      ],
    });
  });

  describe('when the user is authenticated', () => {
    it('returns true', () => {
      isAuthenticatedSignal.set(true);

      expect(runGuard()).toBe(true);
    });

    it('does not redirect', () => {
      isAuthenticatedSignal.set(true);
      runGuard();

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('when the user is NOT authenticated', () => {
    it('returns false', () => {
      isAuthenticatedSignal.set(false);

      expect(runGuard()).toBe(false);
    });

    it('redirects to /auth/login', () => {
      isAuthenticatedSignal.set(false);
      runGuard();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
    });
  });
});
