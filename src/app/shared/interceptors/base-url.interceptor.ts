import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { environment } from '@shared/config/environment';
import { RuntimeConfigService } from '@shared/config/runtime-config.service';

export const baseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith('http://') || req.url.startsWith('https://')) {
    return next(req);
  }

  const baseUrl = inject(RuntimeConfigService).apiBaseUrl;

  if (!baseUrl) {
    throw new Error(
      'API base URL is not configured. For Electron, create electron/config.local.json (see config.example.json).',
    );
  }

  const isAbsolute = baseUrl.startsWith('http://') || baseUrl.startsWith('https://');
  const isDevProxyPath = baseUrl.startsWith('/') && !environment.isElectronRelease;

  if (!isAbsolute && !isDevProxyPath) {
    throw new Error(
      `API base URL must be absolute (http/https) in Electron builds. Got "${baseUrl}".`,
    );
  }

  const baseUrlReq = req.clone({
    url: `${baseUrl.replace(/\/$/, '')}${req.url}`,
  });

  return next(baseUrlReq);
};
