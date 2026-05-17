import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Subject } from 'rxjs';

import { UserEventsService } from './user-events.service';
import { SseRuntimeService } from '@shared/infrastructure/sse/sse-runtime';

describe('UserEventsService', () => {
  const close$ = new Subject<void>();
  const connectSpy = vi.fn(() => close$.asObservable());

  beforeEach(() => {
    connectSpy.mockClear();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        UserEventsService,
        {
          provide: SseRuntimeService,
          useValue: { connect: connectSpy },
        },
      ],
    });
  });

  afterEach(() => {
    close$.complete();
    TestBed.resetTestingModule();
  });

  it('connect() delegates to SseRuntimeService and unsubscribes', () => {
    const service = TestBed.inject(UserEventsService);
    const sub = service.connect().subscribe();
    expect(connectSpy).toHaveBeenCalledWith('/users/events', [
      'project_created',
      'project_updated',
      'project_deleted',
    ]);
    sub.unsubscribe();
  });
});
