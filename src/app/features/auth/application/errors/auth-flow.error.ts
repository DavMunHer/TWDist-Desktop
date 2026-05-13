export type AuthFlowError =
  | { code: 'CREDENTIALS_REQUIRED' }
  | { code: 'INVALID_EMAIL_FORMAT' }
  | { code: 'PASSWORD_TOO_SHORT' }
  | { code: 'USERNAME_REQUIRED' }
  | { code: 'USERNAME_TOO_SHORT' }
  | { code: 'INVALID_CREDENTIALS' }
  | { code: 'INVALID_LOGIN_RESPONSE' }
  | { code: 'REFRESH_FAILED' }
  | { code: 'INVALID_REGISTER_RESPONSE' }
  | { code: 'INVALID_OLD_PASSWORD' }
  | { code: 'NEW_PASSWORD_TOO_SHORT' }
  | { code: 'PASSWORDS_MUST_DIFFER' }
  | { code: 'INVALID_PROFILE_RESPONSE' }
  | { code: 'NETWORK_ERROR' }
  | { code: 'UNKNOWN_AUTH_ERROR' };
