import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthRepository } from "../../domain/repositories/auth.repository";
import { catchError, map, Observable, of, tap, throwError } from "rxjs";
import { LoginCredentialsDto } from "../dto/request/login-credentials.dto";
import { User } from "../../domain/entities/user.entity";
import { UserMapper } from "../mappers/user.mapper";
import { UserResponseDto } from "../dto/response/user-response.dto";
import { RegisterCredentialsDto } from "../dto/request/register-credentials.dto";
import { SessionHintService } from "../services/session-hint.service";
import { requiresAuthContext } from "@shared/interceptors/auth-context.token";
import { AuthError } from "@features/auth/domain/errors/auth.error";

@Injectable()
export class HttpAuthRepository extends AuthRepository {
  constructor(
    private http: HttpClient,
    private sessionHintService: SessionHintService,
  ) {
    super();
  }

  login(credentials: LoginCredentialsDto): Observable<User> {
    return this.http.post<UserResponseDto>('/auth/login', credentials)
      .pipe(
        map(dto => {
          if (!dto || !dto.id) {
            throw new AuthError('INVALID_LOGIN_RESPONSE', 'Invalid login response: missing user data');
          }
          return UserMapper.toDomain(dto);
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