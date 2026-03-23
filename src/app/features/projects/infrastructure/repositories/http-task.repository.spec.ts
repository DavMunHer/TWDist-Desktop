import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, it, expect } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';

import { HttpTaskRepository } from './http-task.repository';
import { Task } from '@features/projects/domain/entities/task.entity';
import { TaskDto } from '@features/projects/infrastructure/dto/task.dto';

describe('HttpTaskRepository', () => {
  let repository: HttpTaskRepository;
  let httpMock: HttpTestingController;
  const start = new Date('2025-01-01');
  const end = new Date('2025-01-02');

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
    repository = new HttpTaskRepository(TestBed.inject(HttpClient));
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('create posts to nested task create URL', () => {
    const task = new Task('t1', 'sec', 'Job', false, start, undefined, undefined, end, undefined, undefined, []);
    repository.create('p1', task).subscribe();
    const req = httpMock.expectOne('/projects/p1/section/sec/task/create');
    expect(req.request.method).toBe('POST');
    const dto: TaskDto = {
      id: 1,
      name: 'Job',
      description: '',
      start_date: start,
      end_date: end,
      completed: false,
    };
    req.flush(dto);
  });

  it('update PUTs to task update URL', () => {
    const task = new Task('t1', 'sec', 'Job', true, start, undefined, undefined, end, undefined, undefined, []);
    repository.update('p1', task).subscribe();
    const req = httpMock.expectOne('/projects/p1/section/sec/task/t1/update');
    expect(req.request.method).toBe('PUT');
    req.flush({
      id: 1,
      name: 'Job',
      description: '',
      start_date: start,
      end_date: end,
      completed: true,
    });
  });

  it('delete sends DELETE', () => {
    repository.delete('p1', 'sec', 't1').subscribe();
    const req = httpMock.expectOne('/projects/p1/section/sec/task/t1/delete');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('findById GETs task', () => {
    repository.findById('p1', 'sec', 't1').subscribe();
    const req = httpMock.expectOne('/projects/p1/section/sec/task/t1/get');
    expect(req.request.method).toBe('GET');
    req.flush({
      id: 1,
      name: 'Job',
      description: '',
      start_date: start,
      end_date: end,
      completed: false,
    });
  });
});
