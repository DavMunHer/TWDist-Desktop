import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, finalize, shareReplay, tap, throwError } from 'rxjs';

import { RefreshSessionUseCase } from '@features/auth/application/use-cases/refresh-session.use-case';
import { SessionHintService } from '@features/auth/infrastructure/services/session-hint.service';
import { TokenService } from '@features/auth/infrastructure/services/token.service';
import { AuthStore } from '@features/auth/presentation/store/auth.store';

export type RefreshState = 'idle' | 'refreshing' | { error: unknown };

@Injectable()
export class TokenRefreshCoordinator {
  private readonly refreshSessionUseCase = inject(RefreshSessionUseCase);
  private readonly sessionHintService = inject(SessionHintService);
  private readonly tokenService = inject(TokenService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private inFlightRefresh$: Observable<void> | null = null;

  readonly state = new BehaviorSubject<RefreshState>('idle');

  runRefresh(): Observable<void> {
    if (this.inFlightRefresh$) {
      return this.inFlightRefresh$;
    }

    const currentState = this.state.value;
    if (isRefreshError(currentState) && !this.sessionHintService.hasSessionHint()) {
      return throwError(() => currentState.error);
    }

    this.state.next('refreshing');
    this.inFlightRefresh$ = this.refreshSessionUseCase.execute().pipe(
      tap(() => {
        this.sessionHintService.markAuthenticated();
        this.state.next('idle');
      }),
      catchError((error: unknown) => {
        this.sessionHintService.clear();
        this.tokenService.clear();
        this.authStore.clearSessionState();
        this.state.next({ error });

        if (this.router.url !== '/auth/login') {
          this.router.navigate(['/auth/login']);
        }

        return throwError(() => error);
      }),
      finalize(() => {
        this.inFlightRefresh$ = null;
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    return this.inFlightRefresh$;
  }
}

function isRefreshError(state: RefreshState): state is { error: unknown } {
  return typeof state === 'object' && state !== null && 'error' in state;
}
