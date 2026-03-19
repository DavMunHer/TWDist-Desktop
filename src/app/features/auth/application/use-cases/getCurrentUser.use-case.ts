import { Injectable } from "@angular/core";
import { AuthRepository } from "@features/auth/domain/repositories/auth.repository";
import { Observable } from "rxjs";
import { User } from "@features/auth/domain/entities/user.entity";

@Injectable()
export class GetCurrentUserUseCase {
  constructor(private authRepository: AuthRepository) {}

  execute(): Observable<User | null> {
    // Just return user, cookie is handled automatically
    return this.authRepository.getCurrentUser();
  }
}