import { AuthFlowError } from '@features/auth/application/errors/auth-flow.error';
import { Result, fail, ok } from '@shared/utils/result';

export class Credentials {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    if (!this.EMAIL_REGEX.test(normalizedEmail)) {
      return fail({ code: 'INVALID_EMAIL_FORMAT' });
    }

    if (normalizedPassword.length < 3) {
      return fail({ code: 'PASSWORD_TOO_SHORT' });
    }

    return ok(new Credentials(normalizedEmail, normalizedPassword));
  }
}