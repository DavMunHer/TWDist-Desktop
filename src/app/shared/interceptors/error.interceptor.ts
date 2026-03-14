import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
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

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isUnauthorized = error.status === 401;
      // We might actually want to enable login directly after register
      const isAuthRequest = req.url.includes('/auth/login');

      if (isUnauthorized && !isAuthRequest) {
        localStorage.removeItem('has_session');
        authStore.clearSessionState();

        if (router.url !== '/auth/login') {
          router.navigate(['/auth/login']);
        }
      }
      
      return throwError(() => error);
    })
  );
};
