export interface UiError {
  code: string;
  kind: 'validation' | 'network' | 'unexpected';
  message: string;
  fieldErrors?: Record<string, string>;
  retryable?: boolean;
}
