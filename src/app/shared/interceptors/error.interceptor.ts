import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { EMPTY, catchError, throwError } from 'rxjs';
import { AuthStore } from '../../features/auth/presentation/store/auth.store';
import { Router } from '@angular/router';

/**
 * Error Interceptor
 * Catches HTTP responses and globally handles 401 Unauthorized errors 
 * indicating an expired or invalid session token.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const isAuthRequest = req.url.includes('/auth/login') || req.url.includes('/users/create');
  const hasSessionHint = !!localStorage.getItem('has_session');

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
        localStorage.removeItem('has_session');
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
