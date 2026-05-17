import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

import { refreshTokenInterceptor } from './refresh-token.interceptor';
import { requiresAuthContext } from '@shared/interceptors/auth-context.token';
import { TokenRefreshCoordinator } from '@features/auth/application/services/token-refresh-coordinator.service';
import { RefreshSessionUseCase } from '@features/auth/application/use-cases/refresh-session.use-case';
import { AuthRepository } from '@features/auth/domain/repositories/auth.repository';
import { HttpAuthRepository } from '@features/auth/infrastructure/repositories/http-auth.repository';
import { AuthStore } from '@features/auth/presentation/store/auth.store';
import { RuntimeConfigService } from '@shared/config/runtime-config.service';
import { Router } from '@angular/router';

describe('refreshTokenInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authStoreMock: { clearSessionState: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authStoreMock = {
      clearSessionState: vi.fn(),
    };
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptors([refreshTokenInterceptor])),
        provideHttpClientTesting(),
        TokenRefreshCoordinator,
        RefreshSessionUseCase,
        { provide: AuthRepository, useClass: HttpAuthRepository },
        { provide: AuthStore, useValue: authStoreMock },
        { provide: Router, useValue: { url: '/projects/upcoming', navigate: vi.fn() } },
        {
          provide: RuntimeConfigService,
          useValue: { isBearerAuthEnabled: () => false, apiBaseUrl: '/api' },
        },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('refreshes once and replays the original request after a protected 401', () => {
    localStorage.setItem('has_session', 'true');
    let result: unknown;

    http.get('/projects/get', requiresAuthContext()).subscribe((response) => (result = response));

    httpMock
      .expectOne('/projects/get')
      .flush({}, { status: 401, statusText: 'Unauthorized' });

    const refreshReq = httpMock.expectOne('/auth/refresh');
    expect(refreshReq.request.method).toBe('POST');
    expect(refreshReq.request.body).toEqual({});
    refreshReq.flush({});

    const replayReq = httpMock.expectOne('/projects/get');
    replayReq.flush({ ok: true });

    expect(result).toEqual({ ok: true });
  });

  it('queues concurrent protected 401s behind one refresh request', () => {
    localStorage.setItem('has_session', 'true');
    const results: unknown[] = [];

    http.get('/projects/get', requiresAuthContext()).subscribe((response) => results.push(response));
    http.get('/tasks/today', requiresAuthContext()).subscribe((response) => results.push(response));

    const projectReq = httpMock.expectOne('/projects/get');
    const todayReq = httpMock.expectOne('/tasks/today');

    projectReq.flush({}, { status: 401, statusText: 'Unauthorized' });
    todayReq.flush({}, { status: 401, statusText: 'Unauthorized' });

    const refreshRequests = httpMock.match('/auth/refresh');
    expect(refreshRequests).toHaveLength(1);
    refreshRequests[0].flush({});

    httpMock.expectOne('/projects/get').flush({ source: 'projects' });
    httpMock.expectOne('/tasks/today').flush({ source: 'today' });

    expect(results).toEqual([{ source: 'projects' }, { source: 'today' }]);
  });

  it('rethrows the original 401 and clears session state when refresh fails', () => {
    let emittedError: HttpErrorResponse | undefined;
    localStorage.setItem('has_session', 'true');

    http.get('/projects/get', requiresAuthContext()).subscribe({
      error: (error: HttpErrorResponse) => (emittedError = error),
    });

    httpMock
      .expectOne('/projects/get')
      .flush({}, { status: 401, statusText: 'Unauthorized' });
    httpMock
      .expectOne('/auth/refresh')
      .flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(emittedError?.status).toBe(401);
    expect(localStorage.getItem('has_session')).toBeNull();
    expect(authStoreMock.clearSessionState).toHaveBeenCalledOnce();
  });

  it('does not recurse on /auth/refresh even when the request is marked protected', () => {
    let emittedError: HttpErrorResponse | undefined;

    http.post('/auth/refresh', {}, requiresAuthContext()).subscribe({
      error: (error: HttpErrorResponse) => (emittedError = error),
    });

    httpMock
      .expectOne('/auth/refresh')
      .flush({}, { status: 401, statusText: 'Unauthorized' });
    httpMock.expectNone('/auth/refresh');

    expect(emittedError?.status).toBe(401);
  });

  it('does not refresh non-authenticated 401s', () => {
    let emittedError: HttpErrorResponse | undefined;

    http.post('/auth/login', { email: 'test@test.com', password: 'password123' }).subscribe({
      error: (error: HttpErrorResponse) => (emittedError = error),
    });

    httpMock
      .expectOne('/auth/login')
      .flush({}, { status: 401, statusText: 'Unauthorized' });
    httpMock.expectNone('/auth/refresh');

    expect(emittedError?.status).toBe(401);
  });

  it('refreshes on 403 when a session can be restored', () => {
    localStorage.setItem('has_session', 'true');
    let result: unknown;

    http.get('/projects/get', requiresAuthContext()).subscribe((response) => (result = response));

    httpMock
      .expectOne('/projects/get')
      .flush({}, { status: 403, statusText: 'Forbidden' });
    httpMock.expectOne('/auth/refresh').flush({});
    httpMock.expectOne('/projects/get').flush({ ok: true });

    expect(result).toEqual({ ok: true });
  });

  it('retries each protected request only once', () => {
    localStorage.setItem('has_session', 'true');
    let emittedError: HttpErrorResponse | undefined;

    http.get('/projects/get', requiresAuthContext()).subscribe({
      error: (error: HttpErrorResponse) => (emittedError = error),
    });

    httpMock
      .expectOne('/projects/get')
      .flush({}, { status: 401, statusText: 'Unauthorized' });
    httpMock.expectOne('/auth/refresh').flush({});
    httpMock
      .expectOne('/projects/get')
      .flush({}, { status: 401, statusText: 'Unauthorized' });
    httpMock.expectNone('/auth/refresh');

    expect(emittedError?.status).toBe(401);
  });
});
