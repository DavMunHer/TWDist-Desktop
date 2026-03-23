import { Injectable, inject } from "@angular/core";
import { AuthRepository } from "@features/auth/domain/repositories/auth.repository";
import { Observable } from "rxjs";

@Injectable()
export class LogoutUseCase {
  private authRepository = inject(AuthRepository);


  execute(): Observable<void> {
    return this.authRepository.logout();
  }
}