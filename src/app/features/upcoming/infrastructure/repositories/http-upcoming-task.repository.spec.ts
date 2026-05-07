import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpUpcomingTaskRepository } from '@features/upcoming/infrastructure/repositories/http-upcoming-task.repository';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('HttpUpcomingTaskRepository', () => {
  let repository: HttpUpcomingTaskRepository;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        HttpUpcomingTaskRepository,
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    repository = TestBed.inject(HttpUpcomingTaskRepository);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requests /tasks/upcoming with from/to query params and maps response', () => {
    repository.findUpcomingTasks(new Date('2026-05-05'), new Date('2026-05-11')).subscribe((aggregates) => {
      expect(aggregates).toHaveLength(1);
      expect(aggregates[0].projectId).toBe('10');
      expect(aggregates[0].task.id).toBe('1');
      expect(aggregates[0].task.completed).toBe(false);
    });

    const req = httpMock.expectOne((request) =>
      request.url === '/tasks/upcoming'
      && request.params.get('from') === '2026-05-05'
      && request.params.get('to') === '2026-05-11',
    );
    expect(req.request.method).toBe('GET');
    req.flush([
      {
        id: 1,
        name: 'Task from upcoming endpoint',
        description: 'Sample',
        startDate: '2026-05-08',
        endDate: '2026-05-08',
        sectionId: 20,
        projectId: 10,
        projectName: 'Demo',
      },
    ]);
  });
});
