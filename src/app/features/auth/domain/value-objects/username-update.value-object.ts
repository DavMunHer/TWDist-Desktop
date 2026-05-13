import { AuthFlowError } from '@features/auth/application/errors/auth-flow.error';
import { Result, fail, ok } from '@shared/utils/result';

export class UsernameUpdate {
  private constructor(
    public readonly username: string
  ) {}

  static tryCreate(username: string): Result<UsernameUpdate, AuthFlowError> {
    const normalized = username.trim();

    if (!normalized) {
      return fail({ code: 'USERNAME_REQUIRED' });
    }

    if (normalized.length < 3) {
      return fail({ code: 'USERNAME_TOO_SHORT' });
    }

    return ok(new UsernameUpdate(normalized));
  }
}
