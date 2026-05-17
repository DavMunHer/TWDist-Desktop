import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { TokenService } from '@features/auth/infrastructure/services/token.service';

/**
 * Sends HTTP-only cookies with requests in browser/dev (proxy) mode.
 * Skipped when Bearer auth is enabled (Electron release).
 */
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  if (inject(TokenService).isBearerAuthEnabled()) {
    return next(req);
  }

  return next(
    req.clone({
      withCredentials: true,
    }),
  );
};
