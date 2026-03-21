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

// Lightweight mock use case objects — only stubbing the execute() we care about for login
const mockLoginUseCase = { execute: vi.fn() };
const mockLogoutUseCase = { execute: vi.fn().mockReturnValue(of(void 0)) };
const mockGetCurrentUserUseCase = { execute: vi.fn().mockReturnValue(of(null)) };
const mockCreateUserUseCase = { execute: vi.fn() };

describe('AuthStore – login slice', () => {
  let store: AuthStore;

  beforeEach(() => {
    // Reset mocks between tests
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
    });
  });

  describe('login()', () => {
    it('sets isLoading = true while the HTTP call is in flight', () => {
      // Subject lets us control when the observable resolves
      const pending$ = new Subject<User>();
      mockLoginUseCase.execute.mockReturnValue(pending$.asObservable());

      store.login(CREDENTIALS);

      expect(store.isLoading()).toBe(true);
    });

    it('clears any previous error when a new login attempt begins', () => {
      // First, simulate a failed login to set an error
      mockLoginUseCase.execute.mockReturnValue(throwError(() => new Error('previous error')));
      store.login(CREDENTIALS);

      // Then start a new attempt that stays in flight
      const pending$ = new Subject<User>();
      mockLoginUseCase.execute.mockReturnValue(pending$.asObservable());
      store.login(CREDENTIALS);

      expect(store.error()).toBeNull();
    });

    it('updates user, sets isAuthenticated = true, clears isLoading on success', () => {
      mockLoginUseCase.execute.mockReturnValue(of(MOCK_USER));

      store.login(CREDENTIALS);

      expect(store.user()).toEqual(MOCK_USER);
      expect(store.isAuthenticated()).toBe(true);
      expect(store.isLoading()).toBe(false);
      expect(store.error()).toBeNull();
    });

    it('sets the error message and clears isLoading on failure (Error instance)', () => {
      mockLoginUseCase.execute.mockReturnValue(
        throwError(() => new Error('Invalid email or password'))
      );

      store.login(CREDENTIALS);

      expect(store.error()).toBe('Invalid email or password');
      expect(store.isLoading()).toBe(false);
      expect(store.isAuthenticated()).toBe(false);
      expect(store.user()).toBeNull();
    });

    it('uses a fallback message for non-Error throwables', () => {
      mockLoginUseCase.execute.mockReturnValue(throwError(() => 'raw string error'));

      store.login(CREDENTIALS);

      expect(store.error()).toBe('Unable to login. Please try again.');
    });

    it('passes the received credentials directly to loginUseCase.execute()', () => {
      mockLoginUseCase.execute.mockReturnValue(of(MOCK_USER));

      store.login(CREDENTIALS);

      expect(mockLoginUseCase.execute).toHaveBeenCalledWith(CREDENTIALS);
    });
  });
});
