import { AuthFlowError } from '@features/auth/application/errors/auth-flow.error';
import { AuthUiError } from '@features/auth/presentation/models/auth-ui-error';

export function toAuthUiError(error: AuthFlowError): AuthUiError {
  switch (error.code) {
    case 'CREDENTIALS_REQUIRED':
      return {
        code: error.code,
        kind: 'validation',
        message: 'Email and password are required',
        fieldErrors: {
          email: 'Email is required',
          password: 'Password is required',
        },
        retryable: false,
      };
    case 'USERNAME_REQUIRED':
      return {
        code: error.code,
        kind: 'validation',
        message: 'Username is required',
        fieldErrors: { username: 'Username is required' },
        retryable: false,
      };
    case 'INVALID_CREDENTIALS':
      return {
        code: error.code,
        kind: 'auth',
        message: 'Invalid email or password',
        retryable: false,
      };
    case 'INVALID_LOGIN_RESPONSE':
      return {
        code: error.code,
        kind: 'unexpected',
        message: 'Invalid login response from server',
        retryable: true,
      };
    case 'INVALID_REGISTER_RESPONSE':
      return {
        code: error.code,
        kind: 'unexpected',
        message: 'Invalid registration response from server',
        retryable: true,
      };
    case 'NETWORK_ERROR':
      return {
        code: error.code,
        kind: 'network',
        message: 'Network error. Please try again.',
        retryable: true,
      };
    case 'UNKNOWN_AUTH_ERROR':
      return {
        code: error.code,
        kind: 'unexpected',
        message: 'Unexpected authentication error',
        retryable: true,
      };
  }
}
