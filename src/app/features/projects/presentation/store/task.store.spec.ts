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

  it('mergeExternalTask inserts task when absent', () => {
    const t = new Task('t-new', 's1', 'Remote', false, new Date(), undefined, undefined, undefined, undefined, undefined, []);
    store.mergeExternalTask(t);
    expect(store.tasks()['t-new']?.name).toBe('Remote');
  });

  it('rollbackExternalTaskMerge removes task that was absent before optimistic mergeExternalTask', () => {
    const t = new Task('ghost', 's', 'Ghost', false, new Date(), undefined, undefined, undefined, undefined, undefined, []);
    store.mergeExternalTask(t);
    expect(store.tasks()['ghost']).toBeDefined();
    store.rollbackExternalTaskMerge('ghost', undefined);
    expect(store.tasks()['ghost']).toBeUndefined();
  });

  it('rollbackExternalTaskMerge restores prior row after failed optimistic merge', () => {
    const start = new Date('2026-03-01');
    const prior = new Task('t1', 's1', 'Old', false, start, undefined, undefined, undefined, undefined, undefined, []);
    store.mergeTasks([prior]);
    const optimistic = prior.updateName('New');
    store.mergeExternalTask(optimistic);
    expect(store.tasks()['t1']?.name).toBe('New');
    store.rollbackExternalTaskMerge('t1', prior);
    expect(store.tasks()['t1']?.name).toBe('Old');
  });

  it('rollbackOptimisticDelete restores deleted subtree and parent subtask ids', () => {
    const child = new Task('c1', 's1', 'Child', false, new Date(), undefined, undefined, undefined, undefined, 'p1', []);
    const parent = new Task('p1', 's1', 'Parent', false, new Date(), undefined, undefined, undefined, undefined, undefined, ['c1']);
    store.mergeTasks([parent, child]);
    const snap = store.snapshotForOptimisticDelete('c1');
    expect(snap).not.toBeNull();
    store.removeTask('c1');
    expect(store.tasks()['c1']).toBeUndefined();
    expect(store.tasks()['p1']?.subtaskIds).not.toContain('c1');
    store.rollbackOptimisticDelete(snap!);
    expect(store.tasks()['c1']?.name).toBe('Child');
    expect(store.tasks()['p1']?.subtaskIds).toContain('c1');
  });

  it('mergeExternalTask preserves subtasks when syncing a flat snapshot', () => {
    const child = new Task('c1', 's1', 'Child', false, new Date(), undefined, undefined, undefined, undefined, 'p1', []);
    const parent = new Task('p1', 's1', 'Parent', false, new Date(), undefined, undefined, undefined, undefined, undefined, ['c1']);
    store.mergeTasks([parent, child]);
    const fromApi = new Task('p1', 's1', 'Parent', true, new Date(), undefined, undefined, undefined, new Date(), undefined, []);
    store.mergeExternalTask(fromApi);
    expect(store.tasks()['p1']?.completed).toBe(true);
    expect(store.tasks()['p1']?.subtaskIds).toEqual(['c1']);
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

  it('editTask completes via update use case when modal toggles completion', () => {
    const start = new Date('2026-01-01');
    const t = new Task('t1', 's1', 'Name', false, start, 'Desc', undefined, undefined, undefined, undefined, []);
    store.mergeTasks([t]);

    store.editTask('p1', 't1', 'Name', 'Desc', start, undefined, true);

    expect(updateExecute).toHaveBeenCalledTimes(1);
    expect(completeExecute).not.toHaveBeenCalled();
    expect(uncompleteExecute).not.toHaveBeenCalled();
    const updatedArg = updateExecute.mock.calls[0]?.[1] as Task;
    expect(updatedArg.completed).toBe(true);
    expect(updatedArg.completedDate).toBeDefined();
  });

  it('editTask uncompletes via update use case when modal toggles completion', () => {
    const start = new Date('2026-01-01');
    const done = new Date('2026-01-02');
    const t = new Task('t1', 's1', 'Name', true, start, 'Desc', undefined, undefined, done, undefined, []);
    store.mergeTasks([t]);

    store.editTask('p1', 't1', 'Name', 'Desc', start, undefined, true);

    expect(updateExecute).toHaveBeenCalledTimes(1);
    expect(completeExecute).not.toHaveBeenCalled();
    expect(uncompleteExecute).not.toHaveBeenCalled();
    expect((updateExecute.mock.calls[0]?.[1] as Task).completed).toBe(false);
  });

  it('editTask updates multiple fields when use case succeeds', () => {
    const start = new Date('2026-01-01');
    const end = new Date('2026-01-02');
    const t = new Task('t1', 's1', 'Old Name', false, start, 'Old description', undefined, end, undefined, undefined, []);
    store.mergeTasks([t]);

    const nextStart = new Date('2026-01-10');
    const nextEnd = new Date('2026-01-20');
    store.editTask('p1', 't1', 'New Name', 'New description', nextStart, nextEnd);

    expect(updateExecute).toHaveBeenCalled();
    expect(store.tasks()['t1']?.name).toBe('New Name');
    expect(store.tasks()['t1']?.description).toBe('New description');
    expect(store.tasks()['t1']?.startDate).toEqual(nextStart);
    expect(store.tasks()['t1']?.endDate).toEqual(nextEnd);
  });

  it('editTask rolls back optimistic update when use case fails', () => {
    const start = new Date('2026-01-01');
    const t = new Task('t1', 's1', 'Old Name', false, start, 'Old description', undefined, undefined, undefined, undefined, []);
    store.mergeTasks([t]);
    updateExecute.mockReturnValue(of({ success: false, error: { code: 'NETWORK_ERROR' as const } }));

    store.editTask('p1', 't1', 'New Name', 'New description', undefined, undefined);

    expect(updateExecute).toHaveBeenCalled();
    expect(store.tasks()['t1']?.name).toBe('Old Name');
    expect(store.tasks()['t1']?.description).toBe('Old description');
    expect(store.tasks()['t1']?.startDate).toEqual(start);
  });

  it('editTask rolls back optimistic update when validation fails', () => {
    const start = new Date('2026-01-01');
    const t = new Task('t1', 's1', 'Old Name', false, start, 'Old description', undefined, undefined, undefined, undefined, []);
    store.mergeTasks([t]);
    updateExecute.mockReturnValue(of({ success: false, error: { code: 'TASK_NAME_REQUIRED' as const } }));

    store.editTask('p1', 't1', '', 'New description', undefined, undefined);

    expect(updateExecute).toHaveBeenCalled();
    expect(store.tasks()['t1']?.name).toBe('Old Name');
    expect(store.tasks()['t1']?.description).toBe('Old description');
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
