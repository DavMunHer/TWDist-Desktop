import { describe, it, expect } from 'vitest';
import { toAuthFlowError } from './auth-flow-error.mapper';
import { AuthError } from '@features/auth/domain/errors/auth.error';

describe('toAuthFlowError', () => {
  it('maps AuthError to AuthFlowError preserving code', () => {
    const error = new AuthError('INVALID_CREDENTIALS', 'Invalid credentials');

    expect(toAuthFlowError(error)).toEqual({ code: 'INVALID_CREDENTIALS' });
  });

  it('maps unknown errors to NETWORK_ERROR', () => {
    expect(toAuthFlowError(new Error('boom'))).toEqual({ code: 'NETWORK_ERROR' });
    expect(toAuthFlowError('raw-error')).toEqual({ code: 'NETWORK_ERROR' });
  });
});
