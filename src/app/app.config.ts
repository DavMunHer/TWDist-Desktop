import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { routes } from './app.routes';
import { PROJECT_FEATURE_PROVIDERS } from './features/projects/projects.providers';
import { baseUrlInterceptor } from './shared/interceptors/base-url.interceptor';
import { credentialsInterceptor } from './shared/interceptors/credentials.interceptor';
import { AUTH_FEATURE_PROVIDERS } from './features/auth/auth.providers';
import { AuthStore } from './features/auth/presentation/store/auth.store';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation()),
    provideHttpClient(
      withInterceptors([baseUrlInterceptor, credentialsInterceptor])
    ),
    ...PROJECT_FEATURE_PROVIDERS,
    ...AUTH_FEATURE_PROVIDERS,

    provideAppInitializer(async () => {
      const authStore = inject(AuthStore);
      await firstValueFrom(authStore.checkAuthStatus()).catch(() => {});
    }),
  ],
};
