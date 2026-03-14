export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'INVALID_LOGIN_RESPONSE'
  | 'INVALID_REGISTER_RESPONSE'
  | 'UNKNOWN_AUTH_ERROR';

export class AuthError extends Error {
  constructor(
    public readonly code: AuthErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}