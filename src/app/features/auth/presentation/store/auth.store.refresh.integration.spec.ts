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
import { RuntimeConfigService } from '@shared/config/runtime-config.service';
import { authInterceptor } from '@shared/interceptors/auth.interceptor';

const USER_DTO: UserResponseDto = {
  id: 1,
  email: 'test@test.com',
  username: 'testuser',
};

describe('AuthStore refresh integration', () => {
  describe('cookie auth', () => {
    let store: AuthStore;
    let httpMock: HttpTestingController;

    beforeEach(() => {
      localStorage.clear();

      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          provideHttpClient(withInterceptors([refreshTokenInterceptor, authInterceptor, errorInterceptor])),
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
          {
            provide: RuntimeConfigService,
            useValue: { isBearerAuthEnabled: () => false, apiBaseUrl: '/api' },
          },
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

  describe('bearer auth', () => {
    let bearerStore: AuthStore;
    let bearerHttpMock: HttpTestingController;

    beforeEach(() => {
      TestBed.resetTestingModule();
      localStorage.clear();

      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          provideHttpClient(withInterceptors([refreshTokenInterceptor, authInterceptor, errorInterceptor])),
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
          {
            provide: RuntimeConfigService,
            useValue: { isBearerAuthEnabled: () => true, apiBaseUrl: 'http://localhost:8080/api' },
          },
        ],
      });

      bearerStore = TestBed.inject(AuthStore);
      bearerHttpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
      bearerHttpMock.verify();
      localStorage.clear();
    });

    it('refreshes and replays /auth/me when access token is expired', () => {
      localStorage.setItem('twdist_access_token', 'expired-access');
      localStorage.setItem('twdist_refresh_token', 'valid-refresh');

      bearerStore.checkAuthStatus().subscribe();

      const meReq = bearerHttpMock.expectOne('/auth/me');
      expect(meReq.request.headers.get('Authorization')).toBe('Bearer expired-access');
      meReq.flush({}, { status: 401, statusText: 'Unauthorized' });

      const refreshReq = bearerHttpMock.expectOne('/auth/refresh');
      expect(refreshReq.request.body).toEqual({ refreshToken: 'valid-refresh' });
      expect(refreshReq.request.headers.has('Authorization')).toBe(false);
      refreshReq.flush({
        user: USER_DTO,
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      });

      expect(localStorage.getItem('twdist_access_token')).toBe('new-access');
      expect(localStorage.getItem('twdist_refresh_token')).toBe('new-refresh');

      const replayReq = bearerHttpMock.expectOne('/auth/me');
      expect(replayReq.request.headers.get('Authorization')).toBe('Bearer new-access');
      replayReq.flush(USER_DTO);

      expect(bearerStore.isAuthenticated()).toBe(true);
      expect(localStorage.getItem('twdist_access_token')).toBe('new-access');
      expect(localStorage.getItem('twdist_refresh_token')).toBe('new-refresh');
    });
  });
});
