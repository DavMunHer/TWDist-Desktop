import { computed, inject, Injectable, signal } from "@angular/core";
import { LoginUseCase } from "../../application/use-cases/login.use-case";
import { LogoutUseCase } from "../../application/use-cases/logout.use-case";
import { GetCurrentUserUseCase } from "../../application/use-cases/getCurrentUser.use-case";
import { AuthState } from "../models/auth-state";
import { LoginCredentialsDto } from "../../infrastructure/dto/login-credentials.dto";

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private loginUseCase = inject(LoginUseCase);
  private logoutUseCase = inject(LogoutUseCase);
  private getCurrentUserUseCase = inject(GetCurrentUserUseCase);

  private readonly state = signal<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });

  readonly user = computed(() => this.state().user);
  readonly isAuthenticated = computed(() => this.state().isAuthenticated);

  login(credentials: LoginCredentialsDto): void {
    this.state.update(s => ({ ...s, isLoading: true, error: null }));

    this.loginUseCase.execute(credentials).subscribe({
      next: (user) => {
        // Cookie is already set by server
        // Just update user state
        this.state.update(s => ({
          ...s,
          user,
          isAuthenticated: true,
          isLoading: false,
        }));
      },
      error: (error) => {
        this.state.update(s => ({ 
          ...s, 
          isLoading: false, 
          error: error.message 
        }));
      },
    });
  }

  logout(): void {
    this.logoutUseCase.execute().subscribe({
      next: () => {
        // Server cleared the cookie
        this.state.set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },
    });
  }

  // Call this on app initialization
  checkAuthStatus(): void {
    this.getCurrentUserUseCase.execute().subscribe({
      next: (user) => {
        this.state.update(s => ({
          ...s,
          user,
          isAuthenticated: !!user,
        }));
      },
    });
  }
}