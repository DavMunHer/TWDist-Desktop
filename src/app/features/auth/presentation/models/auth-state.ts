import { User } from "@features/auth/domain/entities/user.entity";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}