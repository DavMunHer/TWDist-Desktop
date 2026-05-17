import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

import { TokenRefreshCoordinator } from '@features/auth/application/services/token-refresh-coordinator.service';
import { SessionHintService } from '@features/auth/infrastructure/services/session-hint.service';
import { TokenService } from '@features/auth/infrastructure/services/token.service';
import {
  canAttemptTokenRefresh,
  isAuthRefreshableStatus,
} from '@shared/interceptors/auth-refresh.util';
import { REQUIRES_AUTH } from '@shared/interceptors/auth-context.token';

export const RETRIED_AFTER_REFRESH = new HttpContextToken<boolean>(() => false);

const REFRESH_EXCLUDED_AUTH_PATHS = ['/auth/refresh', '/auth/login', '/auth/signup', '/auth/logout'];

export const refreshTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const coordinator = inject(TokenRefreshCoordinator);
  const tokenService = inject(TokenService);
  const sessionHintService = inject(SessionHintService);
  const requiresAuth = req.context.get(REQUIRES_AUTH);
  const alreadyRetried = req.context.get(RETRIED_AFTER_REFRESH);

  if (!requiresAuth || alreadyRetried || isExcludedAuthUrl(req.url)) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || !isAuthRefreshableStatus(error.status)) {
        return throwError(() => error);
      }

      if (!canAttemptTokenRefresh(tokenService, sessionHintService)) {
        return throwError(() => error);
      }

      return coordinator.runRefresh().pipe(
        catchError(() => throwError(() => error)),
        switchMap(() =>
          next(
            req.clone({
              context: req.context.set(RETRIED_AFTER_REFRESH, true),
            }),
          ),
        ),
      );
    }),
  );
};

function isExcludedAuthUrl(url: string): boolean {
  const path = stripQueryString(stripOrigin(url));

  return REFRESH_EXCLUDED_AUTH_PATHS.some((authPath) => path.endsWith(authPath));
}

function stripOrigin(url: string): string {
  return url.replace(/^https?:\/\/[^/]+/u, '');
}

function stripQueryString(url: string): string {
  return url.split('?')[0] ?? url;
}
