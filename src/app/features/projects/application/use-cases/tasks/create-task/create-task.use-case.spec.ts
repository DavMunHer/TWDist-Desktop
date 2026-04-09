import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { of, throwError } from 'rxjs';

import { CreateTaskUseCase } from './create-task.use-case';
import { TaskRepository } from '@features/projects/domain/repositories/task.repository';
import { Task } from '@features/projects/domain/entities/task.entity';

describe('CreateTaskUseCase', () => {
  let useCase: CreateTaskUseCase;
  let repo: Partial<TaskRepository>;
  const start = new Date('2025-01-15');

  beforeEach(() => {
    const created = Task.create('Task A', 'sec-1', start, 't-new');
    repo = {
      create: vi.fn().mockReturnValue(of(created)),
    };
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        CreateTaskUseCase,
        { provide: TaskRepository, useValue: repo },
      ],
    });
    useCase = TestBed.inject(CreateTaskUseCase);
  });

  it('delegates Task.create output to taskRepository.create', () => {
    useCase.execute('p1', 'sec-1', 'Task A', start).subscribe((result) => {
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.id).toBe('t-new');
      }
    });

    expect(repo.create).toHaveBeenCalled();
    const taskArg = (repo.create as ReturnType<typeof vi.fn>).mock.calls[0][1] as Task;
    expect(taskArg.name).toBe('Task A');
    expect(taskArg.sectionId).toBe('sec-1');
  });

  it('returns validation error result when task name is invalid', () => {
    useCase.execute('p1', 'sec-1', '').subscribe((result) => {
      expect(result).toEqual({ success: false, error: { code: 'TASK_NAME_REQUIRED' } });
    });

    expect(repo.create).not.toHaveBeenCalled();
  });

  it('maps repository failures to NETWORK_ERROR', () => {
    (repo.create as ReturnType<typeof vi.fn>).mockReturnValue(throwError(() => new Error('boom')));

    useCase.execute('p1', 'sec-1', 'Task A', start).subscribe((result) => {
      expect(result).toEqual({ success: false, error: { code: 'NETWORK_ERROR' } });
    });
  });
});
