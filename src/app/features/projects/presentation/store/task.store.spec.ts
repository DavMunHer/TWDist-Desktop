import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { of, Subject } from 'rxjs';

import { TaskStore } from './task.store';
import { CreateTaskUseCase } from '@features/projects/application/use-cases/tasks/create-task/create-task.use-case';
import { CompleteTaskUseCase } from '@features/projects/application/use-cases/tasks/complete-task/complete-task.use-case';
import { UncompleteTaskUseCase } from '@features/projects/application/use-cases/tasks/uncomplete-task/uncomplete-task.use-case';
import { UpdateTaskUseCase } from '@features/projects/application/use-cases/tasks/update-task/update-task.use-case';
import { DeleteTaskUseCase } from '@features/projects/application/use-cases/tasks/delete-task/delete-task.use-case';
import { Task } from '@features/projects/domain/entities/task.entity';

describe('TaskStore', () => {
  let store: TaskStore;
  const completeExecute = vi.fn();
  const uncompleteExecute = vi.fn();
  const updateExecute = vi.fn();
  const deleteExecute = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    completeExecute.mockImplementation((_projectId: string, t: Task) => of({ success: true, value: t.complete() }));
    uncompleteExecute.mockImplementation((_projectId: string, t: Task) => of({ success: true, value: t.uncomplete() }));
    updateExecute.mockImplementation((_projectId: string, task: Task) => of({ success: true, value: task }));
    deleteExecute.mockReturnValue(of(void 0));

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        TaskStore,
        { provide: CreateTaskUseCase, useValue: { execute: vi.fn() } },
        { provide: CompleteTaskUseCase, useValue: { execute: completeExecute } },
        { provide: UncompleteTaskUseCase, useValue: { execute: uncompleteExecute } },
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
    const responseTask = new Task('t1', 's', 'Name', true, start, undefined, undefined, undefined, new Date(), undefined, []);
    const pendingResult = new Subject<{ success: true; value: Task }>();
    completeExecute.mockReturnValue(pendingResult.asObservable());

    store.mergeTasks([t]);
    store.toggleTaskCompletion('p1', 't1');

    // UI should reflect completion immediately, before backend response.
    expect(store.tasks()['t1']?.completed).toBe(true);

    pendingResult.next({ success: true, value: responseTask });
    pendingResult.complete();

    expect(completeExecute).toHaveBeenCalledWith('p1', expect.objectContaining({ id: 't1' }));
    expect(store.tasks()['t1']?.completed).toBe(true);
    expect(store.tasks()['t1']?.completedDate).toBe(responseTask.completedDate);
  });

  it('toggleTaskCompletion uncompletes through update use case when task is already completed', () => {
    const t = new Task('t1', 's1', 'Done task', true, new Date(), undefined, undefined, undefined, new Date(), undefined, []);
    store.mergeTasks([t]);

    store.toggleTaskCompletion('p1', 't1');

    expect(completeExecute).not.toHaveBeenCalled();
    expect(uncompleteExecute).toHaveBeenCalledWith('p1', expect.objectContaining({ id: 't1', completed: true }));
    expect(updateExecute).not.toHaveBeenCalled();
    expect(store.tasks()['t1']?.completed).toBe(false);
  });

  it('toggleTaskCompletion rolls back optimistic completion when complete use case fails', () => {
    const start = new Date();
    const t = new Task('t1', 's', 'Name', false, start, undefined, undefined, undefined, undefined, undefined, []);
    completeExecute.mockReturnValue(of({ success: false, error: { code: 'NETWORK_ERROR' as const } }));

    store.mergeTasks([t]);
    store.toggleTaskCompletion('p1', 't1');

    expect(completeExecute).toHaveBeenCalledWith('p1', expect.objectContaining({ id: 't1' }));
    expect(store.tasks()['t1']?.completed).toBe(false);
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
