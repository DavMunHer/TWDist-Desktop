import { Observable } from 'rxjs';
import { LoginCredentialsDto } from '../../infrastructure/dto/request/login-credentials.dto';
import { User } from '../entities/user.entity';
import { RegisterCredentialsDto } from '../../infrastructure/dto/request/register-credentials.dto';

export abstract class AuthRepository {
  abstract login(credentials: LoginCredentialsDto): Observable<User>;
  abstract logout(): Observable<void>;
  abstract getCurrentUser(): Observable<User | null>;

  abstract register(dto: RegisterCredentialsDto): Observable<User>;
}
