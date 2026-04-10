import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { of, Subject, throwError } from 'rxjs';

import { AuthStore } from './auth.store';
import { LoginUseCase } from '@features/auth/application/use-cases/login.use-case';
import { LogoutUseCase } from '@features/auth/application/use-cases/logout.use-case';
import { GetCurrentUserUseCase } from '@features/auth/application/use-cases/getCurrentUser.use-case';
import { CreateUserUseCase } from '@features/auth/application/use-cases/createUser.use-case';
import { User } from '@features/auth/domain/entities/user.entity';
import { LoginCredentialsDto } from '@features/auth/infrastructure/dto/request/login-credentials.dto';

const MOCK_USER = new User('1', 'test@test.com', 'testuser');
const CREDENTIALS: LoginCredentialsDto = { email: 'test@test.com', password: 'password123' };

const mockLoginUseCase = { execute: vi.fn() };
const mockLogoutUseCase = { execute: vi.fn().mockReturnValue(of(void 0)) };
const mockGetCurrentUserUseCase = { execute: vi.fn().mockReturnValue(of(null)) };
const mockCreateUserUseCase = { execute: vi.fn() };

describe('AuthStore - login slice', () => {
  let store: AuthStore;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        AuthStore,
        { provide: LoginUseCase, useValue: mockLoginUseCase },
        { provide: LogoutUseCase, useValue: mockLogoutUseCase },
        { provide: GetCurrentUserUseCase, useValue: mockGetCurrentUserUseCase },
        { provide: CreateUserUseCase, useValue: mockCreateUserUseCase },
      ],
    });

    store = TestBed.inject(AuthStore);
  });

  describe('initial state', () => {
    it('starts unauthenticated with no user', () => {
      expect(store.isAuthenticated()).toBe(false);
      expect(store.user()).toBeNull();
    });

    it('starts idle with no error', () => {
      expect(store.isLoading()).toBe(false);
      expect(store.error()).toBeNull();
      expect(store.errorDetails()).toBeNull();
    });
  });

  describe('login()', () => {
    it('sets isLoading = true while the call is in flight', () => {
      const pending$ = new Subject<{ success: true; value: User }>();
      mockLoginUseCase.execute.mockReturnValue(pending$.asObservable());

      store.login(CREDENTIALS);

      expect(store.isLoading()).toBe(true);
    });

    it('clears previous error when a new login attempt begins', () => {
      mockLoginUseCase.execute.mockReturnValue(
        of({ success: false, error: { code: 'INVALID_CREDENTIALS' } })
      );
      store.login(CREDENTIALS);

      const pending$ = new Subject<{ success: true; value: User }>();
      mockLoginUseCase.execute.mockReturnValue(pending$.asObservable());
      store.login(CREDENTIALS);

      expect(store.error()).toBeNull();
      expect(store.errorDetails()).toBeNull();
    });

    it('updates user and auth flags on success', () => {
      mockLoginUseCase.execute.mockReturnValue(of({ success: true, value: MOCK_USER }));

      store.login(CREDENTIALS);

      expect(store.user()).toEqual(MOCK_USER);
      expect(store.isAuthenticated()).toBe(true);
      expect(store.isLoading()).toBe(false);
      expect(store.error()).toBeNull();
      expect(store.errorDetails()).toBeNull();
    });

    it('sets mapped error details on business failure', () => {
      mockLoginUseCase.execute.mockReturnValue(
        of({ success: false, error: { code: 'INVALID_CREDENTIALS' } })
      );

      store.login(CREDENTIALS);

      expect(store.error()).toBe('Invalid email or password');
      expect(store.isLoading()).toBe(false);
      expect(store.isAuthenticated()).toBe(false);
      expect(store.user()).toBeNull();
      expect(store.errorDetails()).toMatchObject({
        kind: 'auth',
        code: 'INVALID_CREDENTIALS',
      });
    });

    it('uses fallback message for non-Error throwables', () => {
      mockLoginUseCase.execute.mockReturnValue(throwError(() => 'raw string error'));

      store.login(CREDENTIALS);

      expect(store.error()).toBe('Unable to login. Please try again.');
      expect(store.errorDetails()).toBeNull();
    });

    it('passes credentials directly to loginUseCase.execute()', () => {
      mockLoginUseCase.execute.mockReturnValue(of({ success: true, value: MOCK_USER }));

      store.login(CREDENTIALS);

      expect(mockLoginUseCase.execute).toHaveBeenCalledWith(CREDENTIALS);
    });
  });
});
