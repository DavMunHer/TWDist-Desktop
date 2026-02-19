import { computed, inject, Injectable, signal } from "@angular/core";
import { catchError, of, tap } from "rxjs";
import { LoginUseCase } from "../../application/use-cases/login.use-case";
import { LogoutUseCase } from "../../application/use-cases/logout.use-case";
import { GetCurrentUserUseCase } from "../../application/use-cases/getCurrentUser.use-case";
import { AuthState } from "../models/auth-state";
import { LoginCredentialsDto } from "../../infrastructure/dto/request/login-credentials.dto";
import { RegisterCredentialsDto } from "../../infrastructure/dto/request/register-credentials.dto";
import { CreateUserUseCase } from "../../application/use-cases/createUser.use-case";

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly loginUseCase = inject(LoginUseCase);
  private readonly logoutUseCase = inject(LogoutUseCase);
  private readonly createUserUseCase = inject(CreateUserUseCase);
  private readonly getCurrentUserUseCase = inject(GetCurrentUserUseCase);

  private readonly state = signal<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });

  private readonly registrationSuccess = signal<boolean>(false);

  readonly user = computed(() => this.state().user);
  readonly isAuthenticated = computed(() => this.state().isAuthenticated);
  readonly isRegistrationSuccess = computed(() => this.registrationSuccess());

  register(credentials: RegisterCredentialsDto): void {
    this.state.update(s => ({ ...s, isLoading: true, error: null }));
    this.registrationSuccess.set(false);

    this.createUserUseCase.execute(credentials).pipe(
      tap((user) => {
        // Registration successful - user created but not authenticated
        this.state.update(s => ({
          ...s,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }));
        this.registrationSuccess.set(true);
      }),
      catchError((error) => {
        this.state.update(s => ({
          ...s,
          isLoading: false,
          error: error.message
        }));
        this.registrationSuccess.set(false);
        return of(null);
      })
    ).subscribe();
  }

  login(credentials: LoginCredentialsDto): void {
    this.state.update(s => ({ ...s, isLoading: true, error: null }));

    this.loginUseCase.execute(credentials).pipe(
      tap((user) => {
        // Cookie is already set by server
        // Just update user state
        this.state.update(s => ({
          ...s,
          user,
          isAuthenticated: true,
          isLoading: false,
        }));
      }),
      catchError((error) => {
        this.state.update(s => ({ 
          ...s, 
          isLoading: false, 
          error: error.message 
        }));
        return of(null);
      })
    ).subscribe();
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

  // This is called on app initialization
  checkAuthStatus() {
    return this.getCurrentUserUseCase.execute().pipe(
      tap((user) => {
        this.state.update(s => ({
          ...s,
          user,
          isAuthenticated: !!user,
        }));
      }),
      catchError(() => {
        // Handle 403 or any other error - user is not authenticated
        this.state.update(s => ({
          ...s,
          user: null,
          isAuthenticated: false,
        }));
        return of(null);
      })
    );
  }
}