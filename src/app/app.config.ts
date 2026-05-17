import { ApplicationConfig, inject, provideAppInitializer, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { PROJECT_FEATURE_PROVIDERS } from '@features/projects/projects.providers';
import { authInterceptor } from '@shared/interceptors/auth.interceptor';
import { baseUrlInterceptor } from '@shared/interceptors/base-url.interceptor';
import { credentialsInterceptor } from '@shared/interceptors/credentials.interceptor';
import { errorInterceptor } from '@shared/interceptors/error.interceptor';
import { refreshTokenInterceptor } from '@shared/interceptors/refresh-token.interceptor';
import { AUTH_FEATURE_PROVIDERS } from '@features/auth/auth.providers';
import { AuthStore } from '@features/auth/presentation/store/auth.store';
import { TODAY_FEATURE_PROVIDERS } from '@features/today/today.providers';
import { UPCOMING_FEATURE_PROVIDERS } from '@features/upcoming/upcoming.providers';
import { RuntimeConfigService } from '@shared/config/runtime-config.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withHashLocation()),
    provideHttpClient(
      withInterceptors([
        baseUrlInterceptor,
        authInterceptor,
        credentialsInterceptor,
        errorInterceptor,
        refreshTokenInterceptor,
      ])
    ),
    ...PROJECT_FEATURE_PROVIDERS,
    ...AUTH_FEATURE_PROVIDERS,
    ...TODAY_FEATURE_PROVIDERS,
    ...UPCOMING_FEATURE_PROVIDERS,

    provideAppInitializer(async () => {
      const runtimeConfig = inject(RuntimeConfigService);
      const authStore = inject(AuthStore);
      await runtimeConfig.load();
      return authStore.checkAuthStatus();
    }),
  ],
};
