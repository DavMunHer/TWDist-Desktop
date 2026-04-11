import { Injectable, inject } from "@angular/core";
import { AuthRepository } from "@features/auth/domain/repositories/auth.repository";
import { Observable, of } from "rxjs";
import { User } from "@features/auth/domain/entities/user.entity";
import { LoginCredentialsDto } from "@features/auth/infrastructure/dto/request/login-credentials.dto";
import { catchError, map } from 'rxjs/operators';
import { Credentials } from '@features/auth/domain/value-objects/credentials.value-object';
import { Result, fail, ok } from '@shared/utils/result';
import { AuthFlowError } from '@features/auth/application/errors/auth-flow.error';
import { toAuthFlowError } from '@features/auth/application/errors/auth-flow-error.mapper';

@Injectable()
export class LoginUseCase {
  private readonly authRepository = inject(AuthRepository);

  execute(credentials: LoginCredentialsDto): Observable<Result<User, AuthFlowError>> {
    const credentialsResult = Credentials.tryCreate(credentials.email, credentials.password);
    if (!credentialsResult.success) {
      return of(fail(credentialsResult.error));
    }

    const normalizedCredentials: LoginCredentialsDto = {
      email: credentialsResult.value.email,
      password: credentialsResult.value.password,
    };

    return this.authRepository.login(normalizedCredentials).pipe(
      map((user): Result<User, AuthFlowError> => ok(user)),
      catchError((error: unknown) => of(fail(toAuthFlowError(error)))),
    );
  }
}