import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CompleteTaskUseCase } from '@features/projects/application/use-cases/tasks/complete-task/complete-task.use-case';
import { DeleteTaskUseCase } from '@features/projects/application/use-cases/tasks/delete-task/delete-task.use-case';
import { UncompleteTaskUseCase } from '@features/projects/application/use-cases/tasks/uncomplete-task/uncomplete-task.use-case';
import { UpdateTaskUseCase } from '@features/projects/application/use-cases/tasks/update-task/update-task.use-case';
import { Task } from '@features/projects/domain/entities/task.entity';
import { TaskStore } from '@features/projects/presentation/store/task.store';
import { LoadUpcomingTasksUseCase } from '@features/upcoming/application/use-cases/load-upcoming-tasks/load-upcoming-tasks.use-case';
import { UpcomingTaskAggregate } from '@features/upcoming/domain/models/upcoming-task.aggregate';
import { UpcomingStore } from '@features/upcoming/presentation/store/upcoming.store';
import { ok } from '@shared/utils/result';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';

describe('UpcomingStore', () => {
  let store: UpcomingStore;

  const sampleAggregate: UpcomingTaskAggregate = {
    task: new Task('u1', 's1', 'Upcoming Task', false, new Date('2026-05-07')),
    projectId: 'p1',
    projectName: 'Demo',
  };

  const loadUpcomingTasksUseCaseMock = {
    execute: vi.fn().mockReturnValue(of(ok([sampleAggregate]))),
  };
  const completeTaskUseCaseMock = {
    execute: vi.fn().mockReturnValue(of(ok(sampleAggregate.task.complete()))),
  };
  const uncompleteTaskUseCaseMock = {
    execute: vi.fn().mockReturnValue(of(ok(sampleAggregate.task.uncomplete()))),
  };
  const updateTaskUseCaseMock = {
    execute: vi.fn().mockReturnValue(of(ok(sampleAggregate.task))),
  };
  const deleteTaskUseCaseMock = {
    execute: vi.fn().mockReturnValue(of(void 0)),
  };
  const taskStoreMock = {
    getTask: vi.fn(),
    mergeExternalTask: vi.fn(),
    rollbackExternalTaskMerge: vi.fn(),
    snapshotForOptimisticDelete: vi.fn().mockReturnValue(null),
    removeTask: vi.fn(),
    rollbackOptimisticDelete: vi.fn(),
  };

  beforeEach(() => {
    loadUpcomingTasksUseCaseMock.execute.mockClear();
    completeTaskUseCaseMock.execute.mockClear();
    uncompleteTaskUseCaseMock.execute.mockClear();
    updateTaskUseCaseMock.execute.mockClear();
    deleteTaskUseCaseMock.execute.mockClear();
    taskStoreMock.getTask.mockClear();
    taskStoreMock.mergeExternalTask.mockClear();
    taskStoreMock.rollbackExternalTaskMerge.mockClear();
    taskStoreMock.snapshotForOptimisticDelete.mockClear();
    taskStoreMock.removeTask.mockClear();
    taskStoreMock.rollbackOptimisticDelete.mockClear();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        UpcomingStore,
        { provide: LoadUpcomingTasksUseCase, useValue: loadUpcomingTasksUseCaseMock },
        { provide: CompleteTaskUseCase, useValue: completeTaskUseCaseMock },
        { provide: UncompleteTaskUseCase, useValue: uncompleteTaskUseCaseMock },
        { provide: UpdateTaskUseCase, useValue: updateTaskUseCaseMock },
        { provide: DeleteTaskUseCase, useValue: deleteTaskUseCaseMock },
        { provide: TaskStore, useValue: taskStoreMock },
      ],
    });

    store = TestBed.inject(UpcomingStore);
  });

  it('loads tasks when ensureUpcomingTasksLoaded is called', () => {
    store.ensureUpcomingTasksLoaded();

    expect(loadUpcomingTasksUseCaseMock.execute).toHaveBeenCalledOnce();
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
    expect(store.upcomingGroups().length).toBeGreaterThan(0);
  });

  it('updates selected week when navigating forward', () => {
    store.ensureUpcomingTasksLoaded();
    const initialLabel = store.weekRange().label;

    store.goToNextWeek();

    expect(store.weekRange().label).not.toBe(initialLabel);
  });

  it('delegates rename through update use case', () => {
    store.ensureUpcomingTasksLoaded();
    updateTaskUseCaseMock.execute.mockClear();

    store.renameTask({ id: 'u1', name: 'Renamed task' });

    expect(updateTaskUseCaseMock.execute).toHaveBeenCalledOnce();
  });
});
