import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { LoadTodayTasksUseCase } from '@features/today/application/use-cases/load-today-tasks/load-today-tasks.use-case';
import { TodayTaskRepository } from '@features/today/domain/repositories/today-task.repository';
import { TodayTaskAggregate } from '@features/today/domain/models/today-task.aggregate';
import { Task } from '@features/projects/domain/entities/task.entity';

describe('LoadTodayTasksUseCase', () => {
  let useCase: LoadTodayTasksUseCase;
  let repo: Partial<TodayTaskRepository>;

  beforeEach(() => {
    const aggregate: TodayTaskAggregate = {
      task: new Task('t1', 's1', 'Task today', false, new Date('2026-05-01')),
      projectId: 'p1',
    };

    repo = {
      findTodayTasks: vi.fn().mockReturnValue(of([aggregate])),
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        LoadTodayTasksUseCase,
        { provide: TodayTaskRepository, useValue: repo },
      ],
    });

    useCase = TestBed.inject(LoadTodayTasksUseCase);
  });

  it('returns ok result with today tasks from repository', () => {
    useCase.execute().subscribe((result) => {
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toHaveLength(1);
        expect(result.value[0].task.id).toBe('t1');
        expect(result.value[0].projectId).toBe('p1');
      }
    });

    expect(repo.findTodayTasks).toHaveBeenCalled();
  });

  it('maps repository errors to NETWORK_ERROR', () => {
    (repo.findTodayTasks as ReturnType<typeof vi.fn>).mockReturnValue(
      throwError(() => new Error('network down')),
    );

    useCase.execute().subscribe((result) => {
      expect(result).toEqual({ success: false, error: { code: 'NETWORK_ERROR' } });
    });
  });
});

