import { Observable } from 'rxjs';
import { LoginCredentialsDto } from '@features/auth/infrastructure/dto/request/login-credentials.dto';
import { User } from '@features/auth/domain/entities/user.entity';
import { RegisterCredentialsDto } from '@features/auth/infrastructure/dto/request/register-credentials.dto';
import { UpdateUsernameDto } from '@features/auth/infrastructure/dto/request/update-username.dto';
import { UpdatePasswordDto } from '@features/auth/infrastructure/dto/request/update-password.dto';

export abstract class AuthRepository {
  abstract login(credentials: LoginCredentialsDto): Observable<User>;
  abstract refresh(): Observable<void>;
  abstract logout(): Observable<void>;
  abstract getCurrentUser(): Observable<User | null>;
  abstract register(dto: RegisterCredentialsDto): Observable<User>;
  abstract updateUsername(dto: UpdateUsernameDto): Observable<User>;
  abstract updatePassword(dto: UpdatePasswordDto): Observable<void>;
}
