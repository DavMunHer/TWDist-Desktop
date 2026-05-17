import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';

import { ProjectEventsService } from './project-events.service';
import { SseRuntimeService } from '@shared/infrastructure/sse/sse-runtime';

describe('ProjectEventsService', () => {
  const connectSpy = vi.fn(() => of());

  beforeEach(() => {
    connectSpy.mockClear();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ProjectEventsService,
        {
          provide: SseRuntimeService,
          useValue: { connect: connectSpy },
        },
      ],
    });
  });

  it('connect() passes project id in SSE path', () => {
    const service = TestBed.inject(ProjectEventsService);
    service.connect('42').subscribe();
    expect(connectSpy).toHaveBeenCalledWith(
      '/projects/42/events',
      expect.arrayContaining(['task_created']),
    );
  });
});
