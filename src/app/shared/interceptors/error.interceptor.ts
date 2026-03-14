import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { EMPTY, catchError, throwError } from 'rxjs';
import { AuthStore } from '@features/auth/presentation/store/auth.store';
import { Router } from '@angular/router';
import { SessionHintService } from '@features/auth/infrastructure/services/session-hint.service';

/**
 * Error Interceptor
 * Catches HTTP responses and globally handles 401 Unauthorized errors 
 * indicating an expired or invalid session token.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const sessionHintService = inject(SessionHintService);
  const isAuthRequest = req.url.includes('/auth/login') || req.url.includes('/users/create');
  const hasSessionHint = sessionHintService.hasSessionHint();

  if (!isAuthRequest && !hasSessionHint) {
    if (router.url !== '/auth/login') {
      router.navigate(['/auth/login']);
    }
    return EMPTY;
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isUnauthorized = error.status === 401;

      if (isUnauthorized && !isAuthRequest) {
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
