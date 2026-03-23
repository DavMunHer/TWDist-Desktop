import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { of } from 'rxjs';

import { TaskStore } from './task.store';
import { CreateTaskUseCase } from '@features/projects/application/use-cases/create-task/create-task.use-case';
import { ToggleTaskCompletionUseCase } from '@features/projects/application/use-cases/toggle-task-completion/toggle-task-completion.use-case';
import { Task } from '@features/projects/domain/entities/task.entity';

describe('TaskStore', () => {
  let store: TaskStore;
  const toggleExecute = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    toggleExecute.mockImplementation((t: Task) => of(t.complete()));

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        TaskStore,
        { provide: CreateTaskUseCase, useValue: { execute: vi.fn() } },
        { provide: ToggleTaskCompletionUseCase, useValue: { execute: toggleExecute } },
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
});
