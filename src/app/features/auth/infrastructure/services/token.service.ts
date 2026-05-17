import { Injectable, inject } from '@angular/core';
import { RuntimeConfigService } from '@shared/config/runtime-config.service';

const ACCESS_TOKEN_KEY = 'twdist_access_token';
const REFRESH_TOKEN_KEY = 'twdist_refresh_token';

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly runtimeConfig = inject(RuntimeConfigService);

  isBearerAuthEnabled(): boolean {
    return this.runtimeConfig.isBearerAuthEnabled();
  }

  save(tokens: StoredTokens): void {
    if (!this.isBearerAuthEnabled()) {
      return;
    }

    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }

  getAccessToken(): string | null {
    if (!this.isBearerAuthEnabled()) {
      return null;
    }

    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    if (!this.isBearerAuthEnabled()) {
      return null;
    }

    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  clear(): void {
    if (!this.isBearerAuthEnabled()) {
      return;
    }

    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}
