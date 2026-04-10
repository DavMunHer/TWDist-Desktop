import { Injectable, inject } from "@angular/core";
import { AuthRepository } from "@features/auth/domain/repositories/auth.repository";
import { Observable, of } from "rxjs";
import { User } from "@features/auth/domain/entities/user.entity";
import { RegisterCredentialsDto } from "@features/auth/infrastructure/dto/request/register-credentials.dto";
import { catchError, map } from 'rxjs/operators';
import { RegisterCredentials } from '@features/auth/domain/value-objects/register-credentials.value-object';
import { Result, fail, ok } from '@shared/utils/result';
import { AuthFlowError } from '@features/auth/application/errors/auth-flow.error';
import { AuthError } from '@features/auth/domain/errors/auth.error';

@Injectable()
export class CreateUserUseCase {
  private readonly authRepository = inject(AuthRepository);

  execute(dto: RegisterCredentialsDto): Observable<Result<User, AuthFlowError>> {
    const registerCredentialsResult = RegisterCredentials.tryCreate(
      dto.email,
      dto.password,
      dto.username
    );
    if (!registerCredentialsResult.success) {
      return of(fail(registerCredentialsResult.error));
    }

    const normalizedDto: RegisterCredentialsDto = {
      email: registerCredentialsResult.value.email,
      password: registerCredentialsResult.value.password,
      username: registerCredentialsResult.value.username,
    };

    return this.authRepository.register(normalizedDto).pipe(
      map((user): Result<User, AuthFlowError> => ok(user)),
      catchError((error: unknown) => of(fail(this.mapAuthError(error)))),
    );
  }

  private mapAuthError(error: unknown): AuthFlowError {
    if (error instanceof AuthError) {
      return { code: error.code };
    }

    return { code: 'NETWORK_ERROR' };
  }
}