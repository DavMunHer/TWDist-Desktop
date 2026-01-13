import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthRepository } from "../../domain/repositories/auth.repository";
import { catchError, map, Observable, of } from "rxjs";
import { LoginCredentialsDto } from "../dto/login-credentials.dto";
import { User } from "../../domain/entities/user.entity";
import { AuthResponseDto } from "../dto/auth-response.dto";
import { UserMapper } from "../mappers/user.mapper";
import { UserResponseDto } from "../dto/user-response.dto";

@Injectable()
export class HttpAuthRepository extends AuthRepository {
  constructor(private http: HttpClient) {
    super();
  }

  login(credentials: LoginCredentialsDto): Observable<User> {
    return this.http.post<AuthResponseDto>('/auth/login', credentials)
      .pipe(map(dto => UserMapper.toDomain(dto.user)));
  }

  logout(): Observable<void> {
    // Server clears the cookie
    return this.http.post<void>('/auth/logout', {});
  }

  getCurrentUser(): Observable<User | null> {
    return this.http.get<UserResponseDto>('/auth/me')
      .pipe(
        map(dto => UserMapper.toDomain(dto)),
        catchError(() => of(null)) // If cookie expired, return null
      );
  }
}