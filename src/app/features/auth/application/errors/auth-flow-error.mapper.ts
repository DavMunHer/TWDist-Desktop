import { AuthError } from '@features/auth/domain/errors/auth.error';
import { AuthFlowError } from './auth-flow.error';

export function toAuthFlowError(error: unknown): AuthFlowError {
  if (error instanceof AuthError) {
    return { code: error.code };
  }

  return { code: 'NETWORK_ERROR' };
}