import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of, throwError } from 'rxjs';

import { UncompleteTaskUseCase } from './uncomplete-task.use-case';
import { Task } from '@features/projects/domain/entities/task.entity';
import { TaskRepository } from '@features/projects/domain/repositories/task.repository';

describe('UncompleteTaskUseCase', () => {
  let useCase: UncompleteTaskUseCase;
  const uncomplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    uncomplete.mockImplementation(() => {
      const task = Task.create('Task', 's1', new Date('2025-01-01'), 't1').complete().uncomplete();
      return of(task);
    });

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        UncompleteTaskUseCase,
        {
          provide: TaskRepository,
          useValue: {
            create: vi.fn(),
            update: vi.fn(),
            complete: vi.fn(),
            uncomplete,
            delete: vi.fn(),
            findById: vi.fn(),
          },
        },
      ],
    });

    useCase = TestBed.inject(UncompleteTaskUseCase);
  });

  it('calls repository uncomplete endpoint', () => {
    const task = Task.create('Task', 's1', new Date('2025-01-01'), 't1').complete();

    useCase.execute('p1', task).subscribe((result) => {
      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.value.completed).toBe(false);
    });

    expect(uncomplete).toHaveBeenCalledWith('p1', 's1', 't1');
  });

  it('maps repository failures to NETWORK_ERROR', () => {
    const task = Task.create('Task', 's1', new Date('2025-01-01'), 't1').complete();
    uncomplete.mockReturnValue(throwError(() => new Error('boom')));

    useCase.execute('p1', task).subscribe((result) => {
      expect(result).toEqual({ success: false, error: { code: 'NETWORK_ERROR' } });
    });
  });
});
