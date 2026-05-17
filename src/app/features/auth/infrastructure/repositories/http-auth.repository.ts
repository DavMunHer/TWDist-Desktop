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
import { UpdateUsernameDto } from "@features/auth/infrastructure/dto/request/update-username.dto";
import { UpdatePasswordDto } from "@features/auth/infrastructure/dto/request/update-password.dto";
import { SessionHintService } from "@features/auth/infrastructure/services/session-hint.service";
import { TokenService } from "@features/auth/infrastructure/services/token.service";
import { requiresAuthContext } from "@shared/interceptors/auth-context.token";
import { AuthError } from "@features/auth/domain/errors/auth.error";

@Injectable()
export class HttpAuthRepository extends AuthRepository {
  private http = inject(HttpClient);
  private sessionHintService = inject(SessionHintService);
  private tokenService = inject(TokenService);

  login(credentials: LoginCredentialsDto): Observable<User> {
    return this.http.post<AuthResponseDto>('/auth/login', credentials)
      .pipe(
        tap((dto) => this.persistTokens(dto)),
        map(dto => {
          if (!dto?.user?.id) {
            throw new AuthError('INVALID_LOGIN_RESPONSE', 'Invalid login response: missing user data');
          }
          return UserMapper.toDomain(dto.user);
        }),
        tap(() => this.sessionHintService.markAuthenticated()),
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
    const body = this.tokenService.isBearerAuthEnabled()
      ? { refreshToken: this.tokenService.getRefreshToken() ?? '' }
      : {};

    return this.http.post<AuthResponseDto>('/auth/refresh', body).pipe(
      tap((dto) => this.persistTokens(dto)),
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
    return this.http.post<void>('/auth/logout', {}, requiresAuthContext()).pipe(
      tap(() => this.clearLocalSession()),
      catchError(() => {
        this.clearLocalSession();
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
          this.clearLocalSession();
          return of(null)
        })
      );
  }

  updateUsername(dto: UpdateUsernameDto): Observable<User> {
    return this.http.patch<UserResponseDto>('/users/username', dto, requiresAuthContext())
      .pipe(
        map(responseDto => {
          if (!responseDto?.id) {
            throw new AuthError('INVALID_PROFILE_RESPONSE', 'Invalid profile response: missing user data');
          }
          return UserMapper.toDomain(responseDto);
        }),
        catchError((error: unknown) => {
          if (error instanceof AuthError) {
            return throwError(() => error);
          }
          return throwError(() => new AuthError('UNKNOWN_AUTH_ERROR', 'Unexpected error updating username'));
        })
      );
  }

  updatePassword(dto: UpdatePasswordDto): Observable<void> {
    return this.http.patch<void>('/users/password', dto, requiresAuthContext())
      .pipe(
        map(() => void 0),
        catchError((error: unknown) => {
          if (error instanceof HttpErrorResponse && error.status === 400) {
            return throwError(() => new AuthError('INVALID_OLD_PASSWORD', 'Old password is incorrect'));
          }
          return throwError(() => new AuthError('UNKNOWN_AUTH_ERROR', 'Unexpected error updating password'));
        })
      );
  }

  private persistTokens(dto: AuthResponseDto): void {
    if (!dto.accessToken || !dto.refreshToken) {
      return;
    }

    this.tokenService.save({
      accessToken: dto.accessToken.replace(/^Bearer\s+/i, '').trim(),
      refreshToken: dto.refreshToken.replace(/^Bearer\s+/i, '').trim(),
    });
  }

  private clearLocalSession(): void {
    this.sessionHintService.clear();
    this.tokenService.clear();
  }
}
