import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthRepository } from "../../domain/repositories/auth.repository";
import { catchError, map, Observable, of } from "rxjs";
import { LoginCredentialsDto } from "../dto/request/login-credentials.dto";
import { User } from "../../domain/entities/user.entity";
import { UserMapper } from "../mappers/user.mapper";
import { UserResponseDto } from "../dto/response/user-response.dto";
import { RegisterCredentialsDto } from "../dto/request/register-credentials.dto";

@Injectable()
export class HttpAuthRepository extends AuthRepository {
  constructor(private http: HttpClient) {
    super();
  }

  login(credentials: LoginCredentialsDto): Observable<User> {
    return this.http.post<UserResponseDto>('/auth/login', credentials)
      .pipe(
        map(dto => {
          if (!dto || !dto.id) {
            throw new Error('Invalid login response: missing user data');
          }
          return UserMapper.toDomain(dto);
        })
      );
  }

  register(dto: RegisterCredentialsDto): Observable<User> {
    return this.http.post<UserResponseDto>('/users/create', dto)
      .pipe(
        map(userDto => {
          if (!userDto || !userDto.id) {
            throw new Error('Invalid register response: missing user data');
          }
          return UserMapper.toDomain(userDto);
        })
    );
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