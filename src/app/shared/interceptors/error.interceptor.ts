import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { EMPTY, catchError, throwError } from 'rxjs';
import { AuthStore } from '@features/auth/presentation/store/auth.store';
import { Router } from '@angular/router';
import { SessionHintService } from '@features/auth/infrastructure/services/session-hint.service';
import { REQUIRES_AUTH } from './auth-context.token';

/**
 * Error Interceptor
 * Catches HTTP responses and globally handles 401 Unauthorized errors 
 * indicating an expired or invalid session token.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const sessionHintService = inject(SessionHintService);
  const requiresAuth = req.context.get(REQUIRES_AUTH);
  const hasSessionHint = sessionHintService.hasSessionHint();

  if (requiresAuth && !hasSessionHint) {
    if (router.url !== '/auth/login') {
      router.navigate(['/auth/login']);
    }
    return EMPTY;
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isUnauthorized = error.status === 401;

      if (isUnauthorized && requiresAuth) {
        sessionHintService.clear();
        authStore.clearSessionState();

        if (router.url !== '/auth/login') {
          router.navigate(['/auth/login']);
        }

        return EMPTY;
      }
      
      return throwError(() => error);
    })
  );
};
