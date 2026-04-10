import { AuthFlowError } from '@features/auth/application/errors/auth-flow.error';
import { Result, fail, ok } from '@shared/utils/result';

export class Credentials {
  private constructor(
    public readonly email: string,
    public readonly password: string
  ) {}

  static tryCreate(email: string, password: string): Result<Credentials, AuthFlowError> {
    const normalizedEmail = email.trim();
    const normalizedPassword = password.trim();

    if (!normalizedEmail || !normalizedPassword) {
      return fail({ code: 'CREDENTIALS_REQUIRED' });
    }

    // TODO: Verify email format
    return ok(new Credentials(normalizedEmail, normalizedPassword));
  }
}