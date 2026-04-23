import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { of, throwError } from 'rxjs';

import { ToggleTaskCompletionUseCase } from './toggle-task-completion.use-case';
import { Task } from '@features/projects/domain/entities/task.entity';
import { TaskRepository } from '@features/projects/domain/repositories/task.repository';

describe('ToggleTaskCompletionUseCase', () => {
  let useCase: ToggleTaskCompletionUseCase;
  const complete = vi.fn();
  const uncomplete = vi.fn();

  const start = new Date('2025-01-01');
  const open = Task.create('T', 's', start, 't1');
  const done = open.complete();

  beforeEach(() => {
    vi.clearAllMocks();
    complete.mockImplementation(() => of(done));
    uncomplete.mockImplementation(() => of(open));

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ToggleTaskCompletionUseCase,
        {
          provide: TaskRepository,
          useValue: {
            create: vi.fn(),
            update: vi.fn(),
            complete,
            uncomplete,
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
      expect(complete).toHaveBeenCalledWith('p1', 's', 't1', expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
      expect(uncomplete).not.toHaveBeenCalled();
    });
  });

  it('returns uncompleted task when input was complete', () => {
    useCase.execute('p1', done).subscribe((result) => {
      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.value.completed).toBe(false);
      expect(uncomplete).toHaveBeenCalledWith('p1', 's', 't1');
      expect(complete).not.toHaveBeenCalled();
    });
  });

  it('returns network error when repository update fails', () => {
    complete.mockReturnValue(throwError(() => new Error('Network fail')));

    useCase.execute('p1', open).subscribe((result) => {
      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.error).toEqual({ code: 'NETWORK_ERROR' });
    });
  });
});
