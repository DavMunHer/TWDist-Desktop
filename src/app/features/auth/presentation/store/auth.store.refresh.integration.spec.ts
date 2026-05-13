import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthStore } from './auth.store';
import { LoginUseCase } from '@features/auth/application/use-cases/login.use-case';
import { LogoutUseCase } from '@features/auth/application/use-cases/logout.use-case';
import { CreateUserUseCase } from '@features/auth/application/use-cases/createUser.use-case';
import { GetCurrentUserUseCase } from '@features/auth/application/use-cases/getCurrentUser.use-case';
import { UpdateUsernameUseCase } from '@features/auth/application/use-cases/update-username.use-case';
import { UpdatePasswordUseCase } from '@features/auth/application/use-cases/update-password.use-case';
import { RefreshSessionUseCase } from '@features/auth/application/use-cases/refresh-session.use-case';
import { TokenRefreshCoordinator } from '@features/auth/application/services/token-refresh-coordinator.service';
import { AuthRepository } from '@features/auth/domain/repositories/auth.repository';
import { HttpAuthRepository } from '@features/auth/infrastructure/repositories/http-auth.repository';
import { errorInterceptor } from '@shared/interceptors/error.interceptor';
import { refreshTokenInterceptor } from '@shared/interceptors/refresh-token.interceptor';
import { UserResponseDto } from '@features/auth/infrastructure/dto/response/user-response.dto';

const USER_DTO: UserResponseDto = {
  id: 1,
  email: 'test@test.com',
  username: 'testuser',
};

describe('AuthStore refresh integration', () => {
  let store: AuthStore;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptors([errorInterceptor, refreshTokenInterceptor])),
        provideHttpClientTesting(),
        AuthStore,
        LoginUseCase,
        LogoutUseCase,
        CreateUserUseCase,
        GetCurrentUserUseCase,
        UpdateUsernameUseCase,
        UpdatePasswordUseCase,
        RefreshSessionUseCase,
        TokenRefreshCoordinator,
        { provide: AuthRepository, useClass: HttpAuthRepository },
        { provide: Router, useValue: { url: '/projects/upcoming', navigate: vi.fn() } },
      ],
    });

    store = TestBed.inject(AuthStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('refreshes and replays /auth/me when checkAuthStatus sees an expired access cookie', () => {
    localStorage.setItem('has_session', 'true');

    store.checkAuthStatus().subscribe();

    httpMock
      .expectOne('/auth/me')
      .flush({}, { status: 401, statusText: 'Unauthorized' });
    httpMock.expectOne('/auth/refresh').flush({});
    httpMock.expectOne('/auth/me').flush(USER_DTO);

    expect(store.user()).toEqual(expect.objectContaining({
      id: '1',
      email: 'test@test.com',
      username: 'testuser',
    }));
    expect(store.isAuthenticated()).toBe(true);
  });
});
