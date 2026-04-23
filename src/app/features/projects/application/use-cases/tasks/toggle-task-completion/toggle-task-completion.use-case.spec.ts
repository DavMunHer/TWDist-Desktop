import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { of } from 'rxjs';

import { ToggleTaskCompletionUseCase } from './toggle-task-completion.use-case';
import { Task } from '@features/projects/domain/entities/task.entity';
import { CompleteTaskUseCase } from '@features/projects/application/use-cases/tasks/complete-task/complete-task.use-case';
import { UncompleteTaskUseCase } from '@features/projects/application/use-cases/tasks/uncomplete-task/uncomplete-task.use-case';

describe('ToggleTaskCompletionUseCase', () => {
  let useCase: ToggleTaskCompletionUseCase;
  const completeExecute = vi.fn();
  const uncompleteExecute = vi.fn();

  const start = new Date('2025-01-01');
  const open = Task.create('T', 's', start, 't1');
  const done = open.complete();

  beforeEach(() => {
    vi.clearAllMocks();
    completeExecute.mockImplementation(() => of({ success: true, value: done }));
    uncompleteExecute.mockImplementation(() => of({ success: true, value: open }));

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ToggleTaskCompletionUseCase,
        { provide: CompleteTaskUseCase, useValue: { execute: completeExecute } },
        { provide: UncompleteTaskUseCase, useValue: { execute: uncompleteExecute } },
      ],
    });

    useCase = TestBed.inject(ToggleTaskCompletionUseCase);
  });

  it('delegates incomplete task to CompleteTaskUseCase', () => {
    useCase.execute('p1', open).subscribe((result) => {
      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.value.completed).toBe(true);
      expect(completeExecute).toHaveBeenCalledWith('p1', open);
      expect(uncompleteExecute).not.toHaveBeenCalled();
    });
  });

  it('delegates completed task to UncompleteTaskUseCase', () => {
    useCase.execute('p1', done).subscribe((result) => {
      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.value.completed).toBe(false);
      expect(uncompleteExecute).toHaveBeenCalledWith('p1', done);
      expect(completeExecute).not.toHaveBeenCalled();
    });
  });

  it('returns delegated error from complete use case', () => {
    completeExecute.mockReturnValue(of({ success: false, error: { code: 'NETWORK_ERROR' as const } }));

    useCase.execute('p1', open).subscribe((result) => {
      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.error).toEqual({ code: 'NETWORK_ERROR' });
    });
  });
});
