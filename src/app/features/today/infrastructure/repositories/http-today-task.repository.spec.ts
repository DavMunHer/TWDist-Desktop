import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpTodayTaskRepository } from '@features/today/infrastructure/repositories/http-today-task.repository';

describe('HttpTodayTaskRepository', () => {
  let repository: HttpTodayTaskRepository;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        HttpTodayTaskRepository,
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    repository = TestBed.inject(HttpTodayTaskRepository);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requests /api/tasks/today and maps response to aggregates', () => {
    repository.findTodayTasks().subscribe((aggregates) => {
      expect(aggregates).toHaveLength(1);
      expect(aggregates[0].projectId).toBe('10');
      expect(aggregates[0].projectName).toBe('Demo');
      expect(aggregates[0].task.id).toBe('1');
      expect(aggregates[0].task.completed).toBe(true);
      expect(aggregates[0].task.sectionId).toBe('20');
    });

    const req = httpMock.expectOne('/tasks/today');
    expect(req.request.method).toBe('GET');
    req.flush([
      {
        id: 1,
        name: 'Task from today endpoint',
        description: 'Sample',
        startDate: '2026-05-01',
        endDate: '2026-05-01',
        completedDate: '2026-05-01',
        sectionId: 20,
        projectId: 10,
        projectName: 'Demo',
      },
    ]);
  });
});

