import { Injectable } from "@angular/core";
import { AuthRepository } from "../../domain/repositories/auth.repository";
import { Observable } from "rxjs";
import { User } from "../../domain/entities/user.entity";
import { LoginCredentialsDto } from "../../infrastructure/dto/login-credentials.dto";

@Injectable()
export class LogoutUseCase {
  constructor(private authRepository: AuthRepository) {}

  execute(): Observable<void> {
    return this.authRepository.logout();
  }
}