import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { Observable, of, throwError } from 'rxjs';

import { ProjectStore } from './project.store';
import { LoadProjectUseCase } from '@features/projects/application/use-cases/load-project/load-project.use-case';
import { LoadAllProjectsUseCase } from '@features/projects/application/use-cases/load-all-projects/load-all-projects.use-case';
import { CreateProjectUseCase } from '@features/projects/application/use-cases/create-project/create-project.use-case';
import { ToggleFavoriteUseCase } from '@features/projects/application/use-cases/toggle-favorite/toggle-favorite.use-case';
import { DeleteProjectUseCase } from '@features/projects/application/use-cases/delete-project/delete-project.use-case';
import { UpdateProjectUseCase } from '@features/projects/application/use-cases/update-project/update-project.use-case';
import { SectionStore } from './section.store';
import { TaskStore } from './task.store';
import { ProjectSummaryStore } from './project-summary.store';
import { ProjectEventsService } from '@features/projects/infrastructure/services/project-events.service';
import { UserEventsService } from '@features/projects/infrastructure/services/user-events.service';

describe('ProjectStore', () => {
  let store: ProjectStore;

  const loadAllExecute = vi.fn();
  const loadProjectExecute = vi.fn();
  const createProjectExecute = vi.fn();
  const deleteProjectExecute = vi.fn();
  const mergePendingCounts = vi.fn();
  const removePendingCount = vi.fn();
  const mergeSections = vi.fn();
  const mergeTasks = vi.fn();
  const createSection = vi.fn();
  const createTask = vi.fn();
  const createSubtask = vi.fn();
  const toggleTaskCompletion = vi.fn();
  const getSection = vi.fn();
  const addTaskToSection = vi.fn();
  const removeSection = vi.fn();
  const removeTaskFromSection = vi.fn();
  const removeTask = vi.fn();
  const toggleFavoriteExecute = vi.fn();
  const updateProjectExecute = vi.fn();
  const connectProjectEvents = vi.fn();
  const connectUserEvents = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    loadAllExecute.mockReturnValue(of([]));
    createProjectExecute.mockReturnValue(of({ id: 'new-id', name: 'New', favorite: false, sectionIds: [] }));
    deleteProjectExecute.mockReturnValue(of(void 0));
    loadProjectExecute.mockReturnValue(
      of({
        project: { id: 'p1', name: 'First', favorite: false, sectionIds: ['s1'] },
        sections: [{ id: 's1', name: 'S1', projectId: 'p1', taskIds: [] }],
        tasks: [],
      }),
    );
    connectProjectEvents.mockReturnValue(of());
    connectUserEvents.mockReturnValue(of());
    toggleFavoriteExecute.mockReturnValue(of(void 0));

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ProjectStore,
        { provide: LoadProjectUseCase, useValue: { execute: loadProjectExecute } },
        { provide: LoadAllProjectsUseCase, useValue: { execute: loadAllExecute } },
        { provide: CreateProjectUseCase, useValue: { execute: createProjectExecute } },
        { provide: ToggleFavoriteUseCase, useValue: { execute: toggleFavoriteExecute } },
        { provide: DeleteProjectUseCase, useValue: { execute: deleteProjectExecute } },
        { provide: UpdateProjectUseCase, useValue: { execute: updateProjectExecute } },
        {
          provide: SectionStore,
          useValue: {
            mergeSections,
            createSection,
            getSection,
            addTaskToSection,
            removeSection,
            removeTaskFromSection,
            sections: vi.fn().mockReturnValue({}),
          },
        },
        {
          provide: TaskStore,
          useValue: {
            mergeTasks,
            createTask,
            createSubtask,
            toggleTaskCompletion,
            removeTask,
            tasks: vi.fn().mockReturnValue({}),
          },
        },
        {
          provide: ProjectSummaryStore,
          useValue: { mergePendingCounts, removePendingCount },
        },
        { provide: ProjectEventsService, useValue: { connect: connectProjectEvents } },
        { provide: UserEventsService, useValue: { connect: connectUserEvents } },
      ],
    });
    store = TestBed.inject(ProjectStore);
  });

  it('loadAllProjects with empty summaries clears loading and leaves no projects', () => {
    store.loadAllProjects();
    expect(store.loading()).toBe(false);
    expect(store.projects().length).toBe(0);
    expect(mergePendingCounts).toHaveBeenCalled();
  });

  it('loadProject merges sections/tasks and selects project', () => {
    store.loadProject('p1');
    expect(loadProjectExecute).toHaveBeenCalledWith('p1');
    expect(mergeSections).toHaveBeenCalledWith([{ id: 's1', name: 'S1', projectId: 'p1', taskIds: [] }]);
    expect(mergeTasks).toHaveBeenCalledWith([]);
    expect(store.selectedProjectId()).toBe('p1');
    expect(store.selectedProject()?.id).toBe('p1');
  });

  it('loadAllProjects preserves already loaded sectionIds for same project', () => {
    store.loadProject('p1');
    loadAllExecute.mockReturnValue(
      of([{ project: { id: 'p1', name: 'First', favorite: false, sectionIds: [] }, pendingCount: 3 }]),
    );
    store.loadAllProjects();

    const p = store.projects().find((x) => x.id === 'p1');
    expect(p?.sectionIds).toEqual(['s1']);
    expect(mergePendingCounts).toHaveBeenCalledWith({ p1: 3 });
  });

  it('createProject optimistic flow inserts temp and replaces with backend project', () => {
    store.createProject({ name: 'New', favorite: false });
    const ids = store.projects().map((p) => p.id);
    expect(ids).toContain('new-id');
    expect(ids.some((id) => id.startsWith('temp-'))).toBe(false);
    expect(removePendingCount).toHaveBeenCalled();
  });

  it('createProject rolls back optimistic entry on error', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    createProjectExecute.mockReturnValue(throwError(() => new Error('boom')));
    store.createProject({ name: 'New', favorite: false });
    expect(store.projects().some((p) => p.id.startsWith('temp-'))).toBe(false);
    expect(store.error()).toBe('boom');
    errorSpy.mockRestore();
  });

  it('toggleProjectFavorite optimistically flips favorite and calls use case', () => {
    loadAllExecute.mockReturnValue(
      of([{ project: { id: 'p1', name: 'First', favorite: false, sectionIds: [] }, pendingCount: 0 }]),
    );
    store.loadAllProjects();
    loadProjectExecute.mockClear();
    vi.clearAllMocks();

    store.toggleProjectFavorite('p1');
    const updated = store.projects().find((p) => p.id === 'p1');
    expect(updated?.favorite).toBe(true);
    expect(toggleFavoriteExecute).toHaveBeenCalledWith('p1', true);
  });

  it('deleteProject removes project and pending count', () => {
    loadAllExecute.mockReturnValue(
      of([{ project: { id: 'p1', name: 'First', favorite: false, sectionIds: [] }, pendingCount: 0 }]),
    );
    store.loadAllProjects();
    store.deleteProject('p1');
    expect(deleteProjectExecute).toHaveBeenCalledWith('p1');
    expect(store.projects().find((p) => p.id === 'p1')).toBeUndefined();
    expect(removePendingCount).toHaveBeenCalledWith('p1');
  });

  it('createSection delegates to SectionStore using selected project id', () => {
    store.loadProject('p1');
    store.createSection('Backlog');
    expect(createSection).toHaveBeenCalledWith('p1', 'Backlog', expect.any(Function));
  });

  it('createTask delegates to TaskStore and links task to section', () => {
    store.loadProject('p1');
    createTask.mockImplementation((_p, _s, _n, onCreated) => onCreated?.({ id: 't1' }));
    store.createTask('s1', 'Task');
    expect(createTask).toHaveBeenCalledWith('p1', 's1', 'Task', expect.any(Function));
    expect(addTaskToSection).toHaveBeenCalledWith('s1', 't1');
  });

  it('disconnectFromEvents unsubscribes project and user streams', () => {
    const closeProject = vi.fn();
    const closeUser = vi.fn();
    connectProjectEvents.mockReturnValue(new Observable(() => closeProject));
    connectUserEvents.mockReturnValue(new Observable(() => closeUser));

    store.loadProject('p1');
    store.loadAllProjects();
    store.disconnectFromEvents();

    expect(closeProject).toHaveBeenCalled();
    expect(closeUser).toHaveBeenCalled();
  });
});
