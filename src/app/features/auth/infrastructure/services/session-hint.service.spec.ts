import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, afterEach, describe, it, expect } from 'vitest';
import { SessionHintService } from './session-hint.service';
import { TokenService } from './token.service';
import { RuntimeConfigService } from '@shared/config/runtime-config.service';

describe('SessionHintService', () => {
  let service: SessionHintService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        TokenService,
        {
          provide: RuntimeConfigService,
          useValue: { isBearerAuthEnabled: () => false },
        },
      ],
    });
    service = TestBed.inject(SessionHintService);
    // Always start each test with a clean localStorage
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('creates the service', () => {
    expect(service).toBeTruthy();
  });

  describe('hasSessionHint()', () => {
    it('returns false when no hint is stored', () => {
      expect(service.hasSessionHint()).toBe(false);
    });

    it('returns true after markAuthenticated() is called', () => {
      service.markAuthenticated();

      expect(service.hasSessionHint()).toBe(true);
    });

    it('returns false after clear() is called', () => {
      service.markAuthenticated();
      service.clear();

      expect(service.hasSessionHint()).toBe(false);
    });
  });

  describe('markAuthenticated()', () => {
    it('writes "true" to localStorage under the expected key', () => {
      service.markAuthenticated();

      expect(localStorage.getItem('has_session')).toBe('true');
    });

    it('is idempotent – calling it twice does not cause errors', () => {
      service.markAuthenticated();
      service.markAuthenticated();

      expect(service.hasSessionHint()).toBe(true);
    });
  });

  describe('clear()', () => {
    it('removes the hint key from localStorage', () => {
      service.markAuthenticated();
      service.clear();

      expect(localStorage.getItem('has_session')).toBeNull();
    });

    it('does not throw if there is no hint to clear', () => {
      expect(() => service.clear()).not.toThrow();
    });
  });

  describe('hasSessionHint() with bearer auth', () => {
    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          TokenService,
          {
            provide: RuntimeConfigService,
            useValue: { isBearerAuthEnabled: () => true },
          },
        ],
      });
      service = TestBed.inject(SessionHintService);
      localStorage.clear();
    });

    it('returns true when a refresh token is stored even without has_session', () => {
      localStorage.setItem('twdist_refresh_token', 'refresh-abc');

      expect(service.hasSessionHint()).toBe(true);
    });
  });
});
