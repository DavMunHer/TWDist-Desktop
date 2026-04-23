import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of, throwError } from 'rxjs';

import { CompleteTaskUseCase } from './complete-task.use-case';
import { Task } from '@features/projects/domain/entities/task.entity';
import { TaskRepository } from '@features/projects/domain/repositories/task.repository';

describe('CompleteTaskUseCase', () => {
  let useCase: CompleteTaskUseCase;
  const complete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    complete.mockImplementation(() => {
      const task = Task.create('Task', 's1', new Date('2025-01-01'), 't1').complete();
      return of(task);
    });

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        CompleteTaskUseCase,
        {
          provide: TaskRepository,
          useValue: {
            create: vi.fn(),
            update: vi.fn(),
            complete,
            delete: vi.fn(),
            findById: vi.fn(),
          },
        },
      ],
    });

    useCase = TestBed.inject(CompleteTaskUseCase);
  });

  it('calls repository complete endpoint with english completedDate', () => {
    const task = Task.create('Task', 's1', new Date('2025-01-01'), 't1');

    useCase.execute('p1', task).subscribe((result) => {
      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.value.completed).toBe(true);
    });

    expect(complete).toHaveBeenCalledWith('p1', 's1', 't1', expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
  });

  it('maps repository failures to NETWORK_ERROR', () => {
    const task = Task.create('Task', 's1', new Date('2025-01-01'), 't1');
    complete.mockReturnValue(throwError(() => new Error('boom')));

    useCase.execute('p1', task).subscribe((result) => {
      expect(result).toEqual({ success: false, error: { code: 'NETWORK_ERROR' } });
    });
  });
});
