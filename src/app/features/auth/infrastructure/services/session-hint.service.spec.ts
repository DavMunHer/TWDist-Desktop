import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, afterEach, describe, it, expect } from 'vitest';
import { SessionHintService } from './session-hint.service';

describe('SessionHintService', () => {
  let service: SessionHintService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
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
});
