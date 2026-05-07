import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ProjectsError } from '@features/projects/application/errors/projects.error';
import { Task } from '@features/projects/domain/entities/task.entity';
import { LoadUpcomingTasksUseCase } from '@features/upcoming/application/use-cases/load-upcoming-tasks/load-upcoming-tasks.use-case';
import { UpcomingTaskAggregate } from '@features/upcoming/domain/models/upcoming-task.aggregate';
import { UpcomingTaskRepository } from '@features/upcoming/domain/repositories/upcoming-task.repository';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of, throwError } from 'rxjs';

describe('LoadUpcomingTasksUseCase', () => {
  let useCase: LoadUpcomingTasksUseCase;
  let repo: Partial<UpcomingTaskRepository>;

  beforeEach(() => {
    const aggregate: UpcomingTaskAggregate = {
      task: new Task('u1', 's1', 'Task upcoming', false, new Date('2026-05-07')),
      projectId: 'p1',
      projectName: 'Demo',
    };

    repo = {
      findUpcomingTasks: vi.fn().mockReturnValue(of([aggregate])),
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        LoadUpcomingTasksUseCase,
        { provide: UpcomingTaskRepository, useValue: repo },
      ],
    });

    useCase = TestBed.inject(LoadUpcomingTasksUseCase);
  });

  it('returns ok result with repository data', () => {
    const from = new Date('2026-05-05');
    const to = new Date('2026-05-11');

    useCase.execute(from, to).subscribe((result) => {
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.value).toHaveLength(1);
      expect(result.value[0].task.id).toBe('u1');
      expect(result.value[0].projectId).toBe('p1');
    });

    expect(repo.findUpcomingTasks).toHaveBeenCalledWith(from, to);
  });

  it('maps repository errors to NETWORK_ERROR', () => {
    (repo.findUpcomingTasks as ReturnType<typeof vi.fn>).mockReturnValue(
      throwError(() => new Error('network down')),
    );

    useCase.execute(new Date('2026-05-05'), new Date('2026-05-11')).subscribe((result) => {
      expect(result).toEqual({
        success: false,
        error: { code: 'NETWORK_ERROR' } satisfies ProjectsError,
      });
    });
  });
});
