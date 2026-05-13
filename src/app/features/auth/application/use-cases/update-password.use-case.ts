import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthRepository } from '@features/auth/domain/repositories/auth.repository';
import { PasswordChange } from '@features/auth/domain/value-objects/password-change.value-object';
import { UpdatePasswordDto } from '@features/auth/infrastructure/dto/request/update-password.dto';
import { Result, fail, ok } from '@shared/utils/result';
import { AuthFlowError } from '@features/auth/application/errors/auth-flow.error';
import { toAuthFlowError } from '@features/auth/application/errors/auth-flow-error.mapper';

@Injectable()
export class UpdatePasswordUseCase {
  private readonly authRepository = inject(AuthRepository);

  execute(oldPassword: string, newPassword: string): Observable<Result<void, AuthFlowError>> {
    const validationResult = PasswordChange.tryCreate(oldPassword, newPassword);
    if (!validationResult.success) {
      return of(fail(validationResult.error));
    }

    const dto: UpdatePasswordDto = {
      oldPassword: validationResult.value.oldPassword,
      newPassword: validationResult.value.newPassword,
    };

    return this.authRepository.updatePassword(dto).pipe(
      map((): Result<void, AuthFlowError> => ok(void 0)),
      catchError((error: unknown) => of(fail(toAuthFlowError(error)))),
    );
  }
}
