import { Observable } from 'rxjs';
import { LoginCredentialsDto } from '@features/auth/infrastructure/dto/request/login-credentials.dto';
import { User } from '@features/auth/domain/entities/user.entity';
import { RegisterCredentialsDto } from '@features/auth/infrastructure/dto/request/register-credentials.dto';

export abstract class AuthRepository {
  abstract login(credentials: LoginCredentialsDto): Observable<User>;
  abstract logout(): Observable<void>;
  abstract getCurrentUser(): Observable<User | null>;

  abstract register(dto: RegisterCredentialsDto): Observable<User>;
}
