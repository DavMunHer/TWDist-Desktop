export type AuthFlowError =
  | { code: 'CREDENTIALS_REQUIRED' }
  | { code: 'INVALID_EMAIL_FORMAT' }
  | { code: 'PASSWORD_TOO_SHORT' }
  | { code: 'USERNAME_REQUIRED' }
  | { code: 'INVALID_CREDENTIALS' }
  | { code: 'INVALID_LOGIN_RESPONSE' }
  | { code: 'INVALID_REGISTER_RESPONSE' }
  | { code: 'NETWORK_ERROR' }
  | { code: 'UNKNOWN_AUTH_ERROR' };
