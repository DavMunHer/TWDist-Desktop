import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { UserEventsService } from './user-events.service';

describe('UserEventsService', () => {
  const closeSpy = vi.fn();

  beforeEach(() => {
    closeSpy.mockClear();
    vi.stubGlobal(
      'EventSource',
      class MockEventSource {
        addEventListener = vi.fn();
        close = closeSpy;
        constructor(public url: string) {}
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('connect() returns an Observable and closes EventSource on unsubscribe', () => {
    const service = new UserEventsService();
    const sub = service.connect().subscribe();
    sub.unsubscribe();
    expect(closeSpy).toHaveBeenCalledTimes(1);
  });
});
