import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { beforeEach, describe, it, expect } from 'vitest';

import { ProjectSummaryStore } from './project-summary.store';
import { SectionStore } from './section.store';
import { TaskStore } from './task.store';
import { Section } from '@features/projects/domain/entities/section.entity';
import { Task } from '@features/projects/domain/entities/task.entity';

describe('ProjectSummaryStore', () => {
  let store: ProjectSummaryStore;
  const sectionsState = signal<Record<string, Section>>({});
  const tasksState = signal<Record<string, Task>>({});

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ProjectSummaryStore,
        {
          provide: SectionStore,
          useValue: { sections: sectionsState.asReadonly() },
        },
        {
          provide: TaskStore,
          useValue: { tasks: tasksState.asReadonly() },
        },
      ],
    });
    sectionsState.set({});
    tasksState.set({});
    store = TestBed.inject(ProjectSummaryStore);
  });

  it('mergePendingCounts and pendingCountFor returns cached value', () => {
    store.mergePendingCounts({ p1: 42 });
    expect(store.pendingCountFor('p1')).toBe(42);
  });

  it('removePendingCount drops cached entry', () => {
    store.mergePendingCounts({ p1: 1 });
    store.removePendingCount('p1');
    expect(store.pendingCounts()['p1']).toBeUndefined();
  });

  it('pendingCountFor computes from section/task stores when not cached', () => {
    const start = new Date();
    sectionsState.set({
      s1: new Section('s1', 'Sec', 'p1', ['t1', 't2']),
    });
    tasksState.set({
      t1: new Task('t1', 's1', 'Open', false, start, undefined, undefined, undefined, undefined, undefined, []),
      t2: new Task('t2', 's1', 'Done', true, start, undefined, undefined, undefined, undefined, undefined, []),
    });
    expect(store.pendingCountFor('p1')).toBe(1);
  });
});
