import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '@features/auth/presentation/store/auth.store';

export const authGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

    const isAuthenticated = !!authStore.user();

  if (!isAuthenticated) {
    router.navigate(['/login'])
    return false;
  }

  return true;
};
