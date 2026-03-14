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
      // If the backend responds with a 401, the user's session has expired
      if (error.status === 401) {
        // Clear local session hint
        localStorage.removeItem('has_session');
        
        // Reset the frontend state directly
        authStore.logout();

        // Redirect user back to the login page (or root)
        router.navigate(['/auth/login']);
      }
      
      return throwError(() => error);
    })
  );
};
