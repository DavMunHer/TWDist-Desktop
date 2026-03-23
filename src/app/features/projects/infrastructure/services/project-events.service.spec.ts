import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ProjectEventsService } from './project-events.service';

describe('ProjectEventsService', () => {
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

  it('connect(projectId) subscribes to project-scoped URL and closes on teardown', () => {
    const service = new ProjectEventsService();
    const sub = service.connect('proj-1').subscribe();
    sub.unsubscribe();
    expect(closeSpy).toHaveBeenCalledTimes(1);
  });
});
