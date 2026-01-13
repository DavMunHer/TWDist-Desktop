import { Injectable } from "@angular/core";
import { AuthRepository } from "../../domain/repositories/auth.repository";
import { Observable } from "rxjs";
import { User } from "../../domain/entities/user.entity";
import { LoginCredentialsDto } from "../../infrastructure/dto/login-credentials.dto";

@Injectable()
export class LoginUseCase {
  constructor(private authRepository: AuthRepository) {}

  execute(credentials: LoginCredentialsDto): Observable<User> {
    // Just return user, cookie is handled automatically
    return this.authRepository.login(credentials);
  }
}