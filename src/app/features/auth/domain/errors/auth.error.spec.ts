import { describe, it, expect } from 'vitest';
import { AuthError, AuthErrorCode } from './auth.error';

describe('AuthError', () => {
  const ALL_CODES: AuthErrorCode[] = [
    'INVALID_CREDENTIALS',
    'INVALID_LOGIN_RESPONSE',
    'INVALID_REGISTER_RESPONSE',
    'UNKNOWN_AUTH_ERROR',
  ];

  it('is an instance of Error', () => {
    const err = new AuthError('INVALID_CREDENTIALS', 'Invalid email or password');

    expect(err).toBeInstanceOf(Error);
  });

  it('has name set to "AuthError"', () => {
    const err = new AuthError('INVALID_CREDENTIALS', 'msg');

    expect(err.name).toBe('AuthError');
  });

  it('stores the error code', () => {
    const err = new AuthError('UNKNOWN_AUTH_ERROR', 'Unexpected error');

    expect(err.code).toBe('UNKNOWN_AUTH_ERROR');
  });

  it('stores the message', () => {
    const err = new AuthError('INVALID_LOGIN_RESPONSE', 'Custom message');

    expect(err.message).toBe('Custom message');
  });

  it('can be caught as an Error in a try/catch', () => {
    let caught: unknown;

    try {
      throw new AuthError('INVALID_CREDENTIALS', 'something went wrong');
    } catch (e) {
      caught = e;
    }

    expect(caught).toBeInstanceOf(AuthError);
    expect(caught).toBeInstanceOf(Error);
  });

  it.each(ALL_CODES)('accepts error code "%s"', (code) => {
    const err = new AuthError(code, 'msg');

    expect(err.code).toBe(code);
  });
});
