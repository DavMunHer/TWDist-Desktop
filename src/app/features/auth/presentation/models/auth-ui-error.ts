export interface AuthUiError {
  code: string;
  kind: 'validation' | 'network' | 'auth' | 'unexpected';
  message: string;
  fieldErrors?: Record<string, string>;
  retryable?: boolean;
}
