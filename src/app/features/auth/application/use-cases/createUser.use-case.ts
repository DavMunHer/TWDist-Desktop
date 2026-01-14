import { Injectable } from "@angular/core";
import { AuthRepository } from "../../domain/repositories/auth.repository";
import { Observable } from "rxjs";
import { User } from "../../domain/entities/user.entity";
import { RegisterCredentialsDto } from "../../infrastructure/dto/request/register-credentials.dto";

@Injectable()
export class CreateUserUseCase {
  constructor(private authRepository: AuthRepository) {}

  execute(dto: RegisterCredentialsDto): Observable<User | null> {
    // Just return user, cookie is handled automatically
    return this.authRepository.register(dto);
  }
}