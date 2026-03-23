import { Injectable, inject } from "@angular/core";
import { AuthRepository } from "@features/auth/domain/repositories/auth.repository";
import { Observable } from "rxjs";
import { User } from "@features/auth/domain/entities/user.entity";
import { LoginCredentialsDto } from "@features/auth/infrastructure/dto/request/login-credentials.dto";

@Injectable()
export class LoginUseCase {
  private authRepository = inject(AuthRepository);


  execute(credentials: LoginCredentialsDto): Observable<User> {
    // Just return user, cookie is handled automatically
    return this.authRepository.login(credentials);
  }
}