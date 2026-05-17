import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY } from 'rxjs';

import { SessionHintService } from '@features/auth/infrastructure/services/session-hint.service';
import { TokenService } from '@features/auth/infrastructure/services/token.service';
import { canAttemptTokenRefresh } from '@shared/interceptors/auth-refresh.util';
import { REQUIRES_AUTH } from '@shared/interceptors/auth-context.token';

/**
 * Blocks protected requests when there is no restorable session.
 * Does not handle 401/403 — {@link refreshTokenInterceptor} attempts refresh first;
 * {@link TokenRefreshCoordinator} clears state and redirects when refresh fails.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const sessionHintService = inject(SessionHintService);
  const tokenService = inject(TokenService);
  const requiresAuth = req.context.get(REQUIRES_AUTH);

  if (requiresAuth && !canAttemptTokenRefresh(tokenService, sessionHintService)) {
    if (router.url !== '/auth/login') {
      router.navigate(['/auth/login']);
    }
    return EMPTY;
  }

  return next(req);
};
