import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { of } from 'rxjs';

import { TaskStore } from './task.store';
import { CreateTaskUseCase } from '@features/projects/application/use-cases/tasks/create-task/create-task.use-case';
import { ToggleTaskCompletionUseCase } from '@features/projects/application/use-cases/tasks/toggle-task-completion/toggle-task-completion.use-case';
import { UpdateTaskUseCase } from '@features/projects/application/use-cases/tasks/update-task/update-task.use-case';
import { DeleteTaskUseCase } from '@features/projects/application/use-cases/tasks/delete-task/delete-task.use-case';
import { Task } from '@features/projects/domain/entities/task.entity';

describe('TaskStore', () => {
  let store: TaskStore;
  const toggleExecute = vi.fn();
  const updateExecute = vi.fn();
  const deleteExecute = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    toggleExecute.mockImplementation((t: Task) => of(t.complete()));
    updateExecute.mockImplementation((_projectId: string, task: Task) => of(task));
    deleteExecute.mockReturnValue(of(void 0));

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        TaskStore,
        { provide: CreateTaskUseCase, useValue: { execute: vi.fn() } },
        { provide: ToggleTaskCompletionUseCase, useValue: { execute: toggleExecute } },
        { provide: UpdateTaskUseCase, useValue: { execute: updateExecute } },
        { provide: DeleteTaskUseCase, useValue: { execute: deleteExecute } },
      ],
    });
    store = TestBed.inject(TaskStore);
  });

  it('mergeTasks adds tasks to dictionary', () => {
    const start = new Date();
    const t = new Task('t1', 's', 'Name', false, start, undefined, undefined, undefined, undefined, undefined, []);
    store.mergeTasks([t]);
    expect(store.tasks()['t1']?.name).toBe('Name');
  });

  it('toggleTaskCompletion replaces task from use case result', () => {
    const start = new Date();
    const t = new Task('t1', 's', 'Name', false, start, undefined, undefined, undefined, undefined, undefined, []);
    store.mergeTasks([t]);
    store.toggleTaskCompletion('t1');
    expect(toggleExecute).toHaveBeenCalled();
    expect(store.tasks()['t1']?.completed).toBe(true);
  });

  it('updateTaskName updates task name when use case succeeds', () => {
    const t = new Task('t1', 's1', 'Old Name', false, new Date(), undefined, undefined, undefined, undefined, undefined, []);
    store.mergeTasks([t]);

    store.updateTaskName('p1', 't1', 'New Name');

    expect(updateExecute).toHaveBeenCalled();
    expect(store.tasks()['t1']?.name).toBe('New Name');
  });

  it('deleteTask removes task and descendants on success', () => {
    const child = new Task('c1', 's1', 'Child', false, new Date(), undefined, undefined, undefined, undefined, 'p1', []);
    const parent = new Task('p1', 's1', 'Parent', false, new Date(), undefined, undefined, undefined, undefined, undefined, ['c1']);
    store.mergeTasks([parent, child]);

    const onDeleted = vi.fn();
    store.deleteTask('proj', 's1', 'p1', onDeleted);

    expect(deleteExecute).toHaveBeenCalledWith('proj', 's1', 'p1');
    expect(store.tasks()['p1']).toBeUndefined();
    expect(store.tasks()['c1']).toBeUndefined();
    expect(onDeleted).toHaveBeenCalled();
  });
});
