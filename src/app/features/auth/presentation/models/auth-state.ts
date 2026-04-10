import { User } from "@features/auth/domain/entities/user.entity";
import { AuthUiError } from '@features/auth/presentation/models/auth-ui-error';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  errorDetails: AuthUiError | null;
}