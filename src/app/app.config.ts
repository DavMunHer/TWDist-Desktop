import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

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

    // Check authentication status on app startup
    // This validates the cookie with the backend and updates the auth state
    // Error handling ensures the app doesn't hang if the cookie is invalid
    provideAppInitializer(() => {
      const authStore = inject(AuthStore);
      return authStore.checkAuthStatus();
    }),
  ],
};
