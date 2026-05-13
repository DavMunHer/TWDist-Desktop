import { AuthFlowError } from '@features/auth/application/errors/auth-flow.error';
import { Result, fail, ok } from '@shared/utils/result';

export class PasswordChange {
  private constructor(
    public readonly oldPassword: string,
    public readonly newPassword: string
  ) {}

  static tryCreate(
    oldPassword: string,
    newPassword: string
  ): Result<PasswordChange, AuthFlowError> {
    const normalizedOld = oldPassword.trim();
    const normalizedNew = newPassword.trim();

    if (!normalizedOld || !normalizedNew) {
      return fail({ code: 'CREDENTIALS_REQUIRED' });
    }

    if (normalizedNew.length < 8) {
      return fail({ code: 'NEW_PASSWORD_TOO_SHORT' });
    }

    if (normalizedOld === normalizedNew) {
      return fail({ code: 'PASSWORDS_MUST_DIFFER' });
    }

    return ok(new PasswordChange(normalizedOld, normalizedNew));
  }
}
