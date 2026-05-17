import { Injectable, inject } from '@angular/core';

import { TokenService } from '@features/auth/infrastructure/services/token.service';

@Injectable({ providedIn: 'root' })
export class SessionHintService {
  private readonly storageKey = 'has_session';
  private readonly tokenService = inject(TokenService);

  hasSessionHint(): boolean {
    if (this.tokenService.isBearerAuthEnabled()) {
      return (
        !!this.tokenService.getRefreshToken() ||
        !!this.tokenService.getAccessToken() ||
        !!localStorage.getItem(this.storageKey)
      );
    }

    return !!localStorage.getItem(this.storageKey);
  }

  markAuthenticated(): void {
    localStorage.setItem(this.storageKey, 'true');
  }

  clear(): void {
    localStorage.removeItem(this.storageKey);
  }
}