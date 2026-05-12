import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { AuthRepository } from "@features/auth/domain/repositories/auth.repository";
import { catchError, map, Observable, of, tap, throwError } from "rxjs";
import { LoginCredentialsDto } from "@features/auth/infrastructure/dto/request/login-credentials.dto";
import { User } from "@features/auth/domain/entities/user.entity";
import { UserMapper } from "@features/auth/infrastructure/mappers/user.mapper";
import { AuthResponseDto } from "@features/auth/infrastructure/dto/response/auth-response.dto";
import { UserResponseDto } from "@features/auth/infrastructure/dto/response/user-response.dto";
import { RegisterCredentialsDto } from "@features/auth/infrastructure/dto/request/register-credentials.dto";
import { SessionHintService } from "@features/auth/infrastructure/services/session-hint.service";
import { requiresAuthContext } from "@shared/interceptors/auth-context.token";
import { AuthError } from "@features/auth/domain/errors/auth.error";

@Injectable()
export class HttpAuthRepository extends AuthRepository {
  private http = inject(HttpClient);
  private sessionHintService = inject(SessionHintService);


  login(credentials: LoginCredentialsDto): Observable<User> {
    return this.http.post<AuthResponseDto>('/auth/login', credentials)
      .pipe(
        map(dto => {
          if (!dto?.user?.id) {
            throw new AuthError('INVALID_LOGIN_RESPONSE', 'Invalid login response: missing user data');
          }
          return UserMapper.toDomain(dto.user);
        }),
        tap(() => this.sessionHintService.markAuthenticated()),
        // `unknown` is intentional here: RxJS error channels can contain any value,
        // so we narrow explicitly (`instanceof`) before reading error details.
        catchError((error: unknown) => {
          if (error instanceof HttpErrorResponse && error.status === 401) {
            return throwError(() => new AuthError('INVALID_CREDENTIALS', 'Invalid email or password'));
          }

          if (error instanceof AuthError) {
            return throwError(() => error);
          }

          return throwError(() => new AuthError('UNKNOWN_AUTH_ERROR', 'Unexpected authentication error'));
        })
      );
  }

  refresh(): Observable<void> {
    return this.http.post<unknown>('/auth/refresh', {}).pipe(
      map(() => void 0),
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return throwError(() => new AuthError('REFRESH_FAILED', 'Unable to refresh session'));
        }

        return throwError(() => error);
      })
    );
  }

  register(dto: RegisterCredentialsDto): Observable<User> {
    return this.http.post<UserResponseDto>('/users/create', dto)
      .pipe(
        map(userDto => {
          if (!userDto || !userDto.id) {
            throw new AuthError('INVALID_REGISTER_RESPONSE', 'Invalid register response: missing user data');
          }
          return UserMapper.toDomain(userDto);
        })
    );
  }

  logout(): Observable<void> {
    // Server clears the cookie
    return this.http.post<void>('/auth/logout', {}, requiresAuthContext()).pipe(
      tap(() => this.sessionHintService.clear()),
      catchError(() => {
        // Even if the server fails, clear local session hint
        this.sessionHintService.clear();
        return of(void 0);
      })
    );
  }

  getCurrentUser(): Observable<User | null> {
    if (!this.sessionHintService.hasSessionHint()) {
      return of(null);
    }

    return this.http.get<UserResponseDto>('/auth/me', requiresAuthContext())
      .pipe(
        map(dto => UserMapper.toDomain(dto)),
        catchError(() => {
          // If cookie expired or unauthorized, clear the session hint
          this.sessionHintService.clear();
          return of(null)
        })
      );
  }
}