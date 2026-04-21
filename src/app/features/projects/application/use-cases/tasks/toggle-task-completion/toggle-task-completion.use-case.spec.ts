import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { of, throwError } from 'rxjs';

import { ToggleTaskCompletionUseCase } from './toggle-task-completion.use-case';
import { Task } from '@features/projects/domain/entities/task.entity';
import { TaskRepository } from '@features/projects/domain/repositories/task.repository';

describe('ToggleTaskCompletionUseCase', () => {
  let useCase: ToggleTaskCompletionUseCase;
  const update = vi.fn();

  const start = new Date('2025-01-01');
  const open = Task.create('T', 's', start, 't1');
  const done = open.complete();

  beforeEach(() => {
    vi.clearAllMocks();
    update.mockImplementation((_projectId: string, task: Task) => of(task));

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ToggleTaskCompletionUseCase,
        {
          provide: TaskRepository,
          useValue: {
            create: vi.fn(),
            update,
            delete: vi.fn(),
            findById: vi.fn(),
          },
        },
      ],
    });

    useCase = TestBed.inject(ToggleTaskCompletionUseCase);
  });

  it('returns completed task when input was incomplete', () => {
    useCase.execute('p1', open).subscribe((result) => {
      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.value.completed).toBe(true);
      expect(update).toHaveBeenCalledWith('p1', expect.objectContaining({ completed: true }));
    });
  });

  it('returns uncompleted task when input was complete', () => {
    useCase.execute('p1', done).subscribe((result) => {
      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.value.completed).toBe(false);
      expect(update).toHaveBeenCalledWith('p1', expect.objectContaining({ completed: false }));
    });
  });

  it('returns network error when repository update fails', () => {
    update.mockReturnValue(throwError(() => new Error('Network fail')));

    useCase.execute('p1', open).subscribe((result) => {
      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.error).toEqual({ code: 'NETWORK_ERROR' });
    });
  });
});
