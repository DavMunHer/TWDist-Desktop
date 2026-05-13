import { computed, inject, Injectable, signal } from "@angular/core";
import { catchError, of, tap } from "rxjs";
import { LoginUseCase } from "@features/auth/application/use-cases/login.use-case";
import { LogoutUseCase } from "@features/auth/application/use-cases/logout.use-case";
import { GetCurrentUserUseCase } from "@features/auth/application/use-cases/getCurrentUser.use-case";
import { UpdateUsernameUseCase } from "@features/auth/application/use-cases/update-username.use-case";
import { UpdatePasswordUseCase } from "@features/auth/application/use-cases/update-password.use-case";
import { AuthState } from "@features/auth/presentation/models/auth-state";
import { LoginCredentialsDto } from "@features/auth/infrastructure/dto/request/login-credentials.dto";
import { RegisterCredentialsDto } from "@features/auth/infrastructure/dto/request/register-credentials.dto";
import { CreateUserUseCase } from "@features/auth/application/use-cases/createUser.use-case";
import { toAuthUiError } from '@features/auth/presentation/mappers/auth-ui-error.mapper';
import { AuthUiError } from '@features/auth/presentation/models/auth-ui-error';

interface ProfileState {
  status: 'idle' | 'loading' | 'success' | 'error';
  error: AuthUiError | null;
}

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly loginUseCase = inject(LoginUseCase);
  private readonly logoutUseCase = inject(LogoutUseCase);
  private readonly createUserUseCase = inject(CreateUserUseCase);
  private readonly getCurrentUserUseCase = inject(GetCurrentUserUseCase);
  private readonly updateUsernameUseCase = inject(UpdateUsernameUseCase);
  private readonly updatePasswordUseCase = inject(UpdatePasswordUseCase);

  private readonly state = signal<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    errorDetails: null,
  });

  private readonly registrationSuccess = signal<boolean>(false);

  private readonly profileState = signal<ProfileState>({ status: 'idle', error: null });

  readonly user = computed(() => this.state().user);
  readonly isAuthenticated = computed(() => this.state().isAuthenticated);
  readonly isLoading = computed(() => this.state().isLoading);
  readonly error = computed(() => this.state().error);
  readonly errorDetails = computed(() => this.state().errorDetails);
  readonly isRegistrationSuccess = computed(() => this.registrationSuccess());
  readonly profileStatus = computed(() => this.profileState().status);
  readonly profileError = computed(() => this.profileState().error);

  private setError(message: string, details: AuthUiError | null): void {
    this.state.update((s) => ({
      ...s,
      isLoading: false,
      error: message,
      errorDetails: details,
    }));
  }

  register(credentials: RegisterCredentialsDto): void {
    this.state.update(s => ({ ...s, isLoading: true, error: null, errorDetails: null }));
    this.registrationSuccess.set(false);

    this.createUserUseCase.execute(credentials).pipe(
      tap((result) => {
        if (!result.success) {
          const uiError = toAuthUiError(result.error);
          this.setError(uiError.message, uiError);
          this.registrationSuccess.set(false);
          return;
        }

        // Registration successful - user created but not authenticated
        this.state.update(s => ({
          ...s,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          errorDetails: null,
        }));
        this.registrationSuccess.set(true);
      }),
      catchError((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Unable to create your account. Please try again.';

        this.setError(message, null);
        this.registrationSuccess.set(false);
        return of(null);
      })
    ).subscribe();
  }

  login(credentials: LoginCredentialsDto): void {
    this.state.update(s => ({ ...s, isLoading: true, error: null, errorDetails: null }));

    this.loginUseCase.execute(credentials).pipe(
      tap((result) => {
        if (!result.success) {
          const uiError = toAuthUiError(result.error);
          this.setError(uiError.message, uiError);
          return;
        }

        const user = result.value;
        // Cookie is already set by server
        // Just update user state
        this.state.update(s => ({
          ...s,
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          errorDetails: null,
        }));
      }),
      catchError((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Unable to login. Please try again.';

        this.setError(message, null);
        return of(null);
      })
    ).subscribe();
  }

  logout(): void {
    this.logoutUseCase.execute().subscribe({
      next: () => {
        // Server cleared the cookie
        this.clearSessionState();
      },
    });
  }

  clearSessionState(): void {
    this.state.set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      errorDetails: null,
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

  updateUsername(username: string): void {
    this.profileState.set({ status: 'loading', error: null });

    this.updateUsernameUseCase.execute(username).pipe(
      tap((result) => {
        if (!result.success) {
          const uiError = toAuthUiError(result.error);
          this.profileState.set({ status: 'error', error: uiError });
          return;
        }

        const user = result.value;
        this.state.update(s => ({ ...s, user }));
        this.profileState.set({ status: 'success', error: null });
      }),
      catchError((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Unable to update username. Please try again.';
        this.profileState.set({ status: 'error', error: { code: 'UNKNOWN', kind: 'unexpected', message, retryable: true } });
        return of(null);
      })
    ).subscribe();
  }

  updatePassword(oldPassword: string, newPassword: string): void {
    this.profileState.set({ status: 'loading', error: null });

    this.updatePasswordUseCase.execute(oldPassword, newPassword).pipe(
      tap((result) => {
        if (!result.success) {
          const uiError = toAuthUiError(result.error);
          this.profileState.set({ status: 'error', error: uiError });
          return;
        }

        this.profileState.set({ status: 'success', error: null });
      }),
      catchError((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Unable to update password. Please try again.';
        this.profileState.set({ status: 'error', error: { code: 'UNKNOWN', kind: 'unexpected', message, retryable: true } });
        return of(null);
      })
    ).subscribe();
  }

  resetProfileStatus(): void {
    this.profileState.set({ status: 'idle', error: null });
  }
}