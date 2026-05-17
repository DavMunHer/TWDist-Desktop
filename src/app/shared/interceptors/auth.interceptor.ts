import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { TokenService } from '@features/auth/infrastructure/services/token.service';
import { isBearerExcludedAuthUrl } from '@shared/interceptors/auth-url.util';

/**
 * Attaches `Authorization: Bearer <accessToken>` when running an Electron release
 * build with tokens stored in localStorage.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const accessToken = inject(TokenService).getAccessToken();

  if (!accessToken || isBearerExcludedAuthUrl(req.url)) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),
  );
};
