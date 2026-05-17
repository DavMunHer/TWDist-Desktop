import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, afterEach, describe, expect, it } from 'vitest';

import { SessionHintService } from '@features/auth/infrastructure/services/session-hint.service';
import { TokenService } from '@features/auth/infrastructure/services/token.service';
import { RuntimeConfigService } from '@shared/config/runtime-config.service';
import { canAttemptTokenRefresh, isAuthRefreshableStatus } from './auth-refresh.util';

describe('auth-refresh.util', () => {
  describe('isAuthRefreshableStatus', () => {
    it('returns true for 401 and 403', () => {
      expect(isAuthRefreshableStatus(401)).toBe(true);
      expect(isAuthRefreshableStatus(403)).toBe(true);
    });

    it('returns false for other statuses', () => {
      expect(isAuthRefreshableStatus(500)).toBe(false);
    });
  });

  describe('canAttemptTokenRefresh', () => {
    let tokenService: TokenService;
    let sessionHintService: SessionHintService;

    beforeEach(() => {
      localStorage.clear();
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          TokenService,
          { provide: RuntimeConfigService, useValue: { isBearerAuthEnabled: () => false } },
        ],
      });
      tokenService = TestBed.inject(TokenService);
      sessionHintService = TestBed.inject(SessionHintService);
    });

    afterEach(() => {
      localStorage.clear();
    });

    it('uses session hint for cookie auth', () => {
      sessionHintService.markAuthenticated();

      expect(canAttemptTokenRefresh(tokenService, sessionHintService)).toBe(true);
    });

    it('uses refresh token for bearer auth', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          TokenService,
          { provide: RuntimeConfigService, useValue: { isBearerAuthEnabled: () => true } },
        ],
      });
      tokenService = TestBed.inject(TokenService);
      sessionHintService = TestBed.inject(SessionHintService);
      localStorage.setItem('twdist_refresh_token', 'refresh-abc');

      expect(canAttemptTokenRefresh(tokenService, sessionHintService)).toBe(true);
    });
  });
});
