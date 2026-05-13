import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthRepository } from '@features/auth/domain/repositories/auth.repository';
import { User } from '@features/auth/domain/entities/user.entity';
import { UsernameUpdate } from '@features/auth/domain/value-objects/username-update.value-object';
import { UpdateUsernameDto } from '@features/auth/infrastructure/dto/request/update-username.dto';
import { Result, fail, ok } from '@shared/utils/result';
import { AuthFlowError } from '@features/auth/application/errors/auth-flow.error';
import { toAuthFlowError } from '@features/auth/application/errors/auth-flow-error.mapper';

@Injectable()
export class UpdateUsernameUseCase {
  private readonly authRepository = inject(AuthRepository);

  execute(username: string): Observable<Result<User, AuthFlowError>> {
    const validationResult = UsernameUpdate.tryCreate(username);
    if (!validationResult.success) {
      return of(fail(validationResult.error));
    }

    const dto: UpdateUsernameDto = {
      username: validationResult.value.username,
    };

    return this.authRepository.updateUsername(dto).pipe(
      map((user): Result<User, AuthFlowError> => ok(user)),
      catchError((error: unknown) => of(fail(toAuthFlowError(error)))),
    );
  }
}
