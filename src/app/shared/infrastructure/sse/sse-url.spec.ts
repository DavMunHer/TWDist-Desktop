import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildSseUrl } from './sse-url';

describe('buildSseUrl', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('joins base URL and path', () => {
    expect(buildSseUrl('https://api.example.com/api', '/users/events')).toBe(
      'https://api.example.com/api/users/events',
    );
  });

  it('rejects empty base URL', () => {
    expect(() => buildSseUrl('', '/users/events')).toThrow(/not configured/i);
  });

  it('resolves a relative base against http(s) page origin (dev-server proxy)', () => {
    vi.stubGlobal('window', {
      location: { protocol: 'http:', origin: 'http://localhost:4200' },
    });

    expect(buildSseUrl('/api', '/users/events')).toBe(
      'http://localhost:4200/api/users/events',
    );
  });

  it('rejects relative base on non-http origins such as app://', () => {
    vi.stubGlobal('window', {
      location: { protocol: 'app:', origin: 'app://.' },
    });

    expect(() => buildSseUrl('/api', '/users/events')).toThrow(/absolute API base URL/i);
  });
});
