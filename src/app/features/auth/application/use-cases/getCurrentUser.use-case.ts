import { Injectable } from "@angular/core";
import { AuthRepository } from "../../domain/repositories/auth.repository";
import { Observable } from "rxjs";
import { User } from "../../domain/entities/user.entity";
import { LoginCredentialsDto } from "../../infrastructure/dto/request/login-credentials.dto";

@Injectable()
export class GetCurrentUserUseCase {
  constructor(private authRepository: AuthRepository) {}

  execute(): Observable<User | null> {
    // Just return user, cookie is handled automatically
    return this.authRepository.getCurrentUser();
  }
}