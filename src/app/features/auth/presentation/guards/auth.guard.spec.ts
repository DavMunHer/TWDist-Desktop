import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { signal, provideZonelessChangeDetection } from '@angular/core';

import { authGuard } from './auth.guard';
import { AuthStore } from '@features/auth/presentation/store/auth.store';
import { User } from '@features/auth/domain/entities/user.entity';

const MOCK_USER = new User('1', 'test@test.com', 'testuser');

describe('authGuard', () => {
  // Stubs — typed as signal<User | null> since authGuard reads authStore.user()
  let userSignal: ReturnType<typeof signal<User | null>>;
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };

  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = {} as RouterStateSnapshot;

  /**
   * Runs the guard inside an Angular injection context so inject() calls resolve
   * against the configured TestBed providers.
   */
  const runGuard = () =>
    TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

  beforeEach(() => {
    userSignal = signal<User | null>(null);
    mockRouter = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthStore, useValue: { user: userSignal } },
        { provide: Router, useValue: mockRouter },
      ],
    });
  });

  describe('when the user is authenticated', () => {
    it('returns true', () => {
      userSignal.set(MOCK_USER);

      expect(runGuard()).toBe(true);
    });

    it('does not redirect', () => {
      userSignal.set(MOCK_USER);
      runGuard();

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('when the user is NOT authenticated (user is null)', () => {
    it('returns false', () => {
      userSignal.set(null);

      expect(runGuard()).toBe(false);
    });

    it('redirects to /login', () => {
      userSignal.set(null);
      runGuard();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  // NOTE: authGuard uses authStore.user() (not isAuthenticated) which is inconsistent with
  // the rest of the store API. This means a user with null in the .user() signal but
  // isAuthenticated = true would incorrectly be redirected. This is a design gap worth addressing.
  it('treats a user with an undefined/falsy value as unauthenticated', () => {
    userSignal.set(null);

    expect(runGuard()).toBe(false);
  });
});
