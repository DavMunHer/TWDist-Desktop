export type AuthFlowError =
  | { code: 'CREDENTIALS_REQUIRED' }
  | { code: 'USERNAME_REQUIRED' }
  | { code: 'INVALID_CREDENTIALS' }
  | { code: 'INVALID_LOGIN_RESPONSE' }
  | { code: 'INVALID_REGISTER_RESPONSE' }
  | { code: 'NETWORK_ERROR' }
  | { code: 'UNKNOWN_AUTH_ERROR' };
