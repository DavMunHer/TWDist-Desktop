import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';

import { HttpAuthRepository } from './http-auth.repository';
import { SessionHintService } from '@features/auth/infrastructure/services/session-hint.service';
import { AuthError } from '@features/auth/domain/errors/auth.error';
import { User } from '@features/auth/domain/entities/user.entity';
import { UserResponseDto } from '@features/auth/infrastructure/dto/response/user-response.dto';
import { LoginCredentialsDto } from '@features/auth/infrastructure/dto/request/login-credentials.dto';

const CREDENTIALS: LoginCredentialsDto = { email: 'test@test.com', password: 'password123' };
const USER_DTO: UserResponseDto = { id: 1, email: 'test@test.com', username: 'testuser' };

/**
 * NOTE: vitest uses esbuild which does NOT emit TypeScript decorator metadata.
 * HttpAuthRepository uses constructor injection, so we cannot rely on the DI factory.
 * Fix: after TestBed is set up, instantiate HttpAuthRepository manually by pulling
 * HttpClient and SessionHintService from the injector.
 */
describe('HttpAuthRepository', () => {
  let repository: HttpAuthRepository;
  let httpMock: HttpTestingController;
  let sessionHintService: SessionHintService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        // SessionHintService is providedIn: 'root' – available automatically
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    sessionHintService = TestBed.inject(SessionHintService);

    // Manually construct the repository: bypasses the broken DI factory
    const http = TestBed.inject(HttpClient);
    repository = new HttpAuthRepository(http, sessionHintService);

    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify(); // Assert no unexpected requests are pending
    localStorage.clear();
  });

  describe('login()', () => {
    it('sends a POST to /auth/login with the given credentials', () => {
      repository.login(CREDENTIALS).subscribe();

      const req = httpMock.expectOne('/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(CREDENTIALS);

      req.flush(USER_DTO);
    });

    it('maps the response DTO to a User domain entity', () => {
      let result: User | undefined;
      repository.login(CREDENTIALS).subscribe((user) => (result = user));

      httpMock.expectOne('/auth/login').flush(USER_DTO);

      expect(result).toBeInstanceOf(User);
      expect(result?.id).toBe('1');
      expect(result?.email).toBe('test@test.com');
      expect(result?.username).toBe('testuser');
    });

    it('calls sessionHintService.markAuthenticated() on success', () => {
      const markSpy = vi.spyOn(sessionHintService, 'markAuthenticated');

      repository.login(CREDENTIALS).subscribe();
      httpMock.expectOne('/auth/login').flush(USER_DTO);

      expect(markSpy).toHaveBeenCalledOnce();
    });

    it('throws AuthError("INVALID_CREDENTIALS") on a 401 response', () => {
      let error: AuthError | undefined;
      repository.login(CREDENTIALS).subscribe({ error: (e) => (error = e) });

      httpMock
        .expectOne('/auth/login')
        .flush({}, { status: 401, statusText: 'Unauthorized' });

      expect(error).toBeInstanceOf(AuthError);
      expect(error?.code).toBe('INVALID_CREDENTIALS');
    });

    it('throws AuthError("INVALID_LOGIN_RESPONSE") when the response body has no id', () => {
      let error: AuthError | undefined;
      repository.login(CREDENTIALS).subscribe({ error: (e) => (error = e) });

      // Server returns 200 but the body is missing the `id` field
      httpMock.expectOne('/auth/login').flush({ email: 'test@test.com' });

      expect(error).toBeInstanceOf(AuthError);
      expect(error?.code).toBe('INVALID_LOGIN_RESPONSE');
    });

    it('throws AuthError("UNKNOWN_AUTH_ERROR") on a non-401 HTTP error', () => {
      let error: AuthError | undefined;
      repository.login(CREDENTIALS).subscribe({ error: (e) => (error = e) });

      httpMock
        .expectOne('/auth/login')
        .flush({}, { status: 500, statusText: 'Internal Server Error' });

      expect(error).toBeInstanceOf(AuthError);
      expect(error?.code).toBe('UNKNOWN_AUTH_ERROR');
    });

    it('does NOT call markAuthenticated() when login fails', () => {
      const markSpy = vi.spyOn(sessionHintService, 'markAuthenticated');

      repository.login(CREDENTIALS).subscribe({ error: () => {} });
      httpMock
        .expectOne('/auth/login')
        .flush({}, { status: 401, statusText: 'Unauthorized' });

      expect(markSpy).not.toHaveBeenCalled();
    });
  });
});
