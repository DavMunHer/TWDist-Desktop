import { describe, it, expect } from 'vitest';
import { Credentials } from './credentials.value-object';

describe('Credentials', () => {
  describe('constructor', () => {
    it('creates a Credentials instance with valid email and password', () => {
      const creds = new Credentials('user@example.com', 'password123');

      expect(creds.email).toBe('user@example.com');
      expect(creds.password).toBe('password123');
    });

    it('throws when email is an empty string', () => {
      expect(() => new Credentials('', 'password123')).toThrow(
        'Email and password are required'
      );
    });

    it('throws when password is an empty string', () => {
      expect(() => new Credentials('user@example.com', '')).toThrow(
        'Email and password are required'
      );
    });

    it('throws when both email and password are empty', () => {
      expect(() => new Credentials('', '')).toThrow(
        'Email and password are required'
      );
    });
  });

  describe('static create()', () => {
    it('returns a Credentials instance with the provided values', () => {
      const creds = Credentials.create('admin@app.io', 'securepass');

      expect(creds).toBeInstanceOf(Credentials);
      expect(creds.email).toBe('admin@app.io');
      expect(creds.password).toBe('securepass');
    });

    // NOTE: This test documents a known gap in the domain: the VO only checks for
    // emptiness but the TODO comment indicates email format validation is pending.
    it('does NOT validate email format (known TODO – only emptiness is checked)', () => {
      expect(() => Credentials.create('not-an-email', 'password123')).not.toThrow();
    });
  });

  describe('immutability', () => {
    it('exposes email and password as readonly values', () => {
      const creds = new Credentials('user@example.com', 'password123');

      // TypeScript enforces readonly at compile time; this confirms runtime values are stable.
      expect(Object.isFrozen(creds)).toBe(false); // class instances are not frozen by default
      expect(creds.email).toBe('user@example.com');
      expect(creds.password).toBe('password123');
    });
  });
});
