import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { of } from 'rxjs';

import { ProjectStore } from './project.store';
import { LoadProjectUseCase } from '@features/projects/application/use-cases/load-project/load-project.use-case';
import { LoadAllProjectsUseCase } from '@features/projects/application/use-cases/load-all-projects/load-all-projects.use-case';
import { CreateProjectUseCase } from '@features/projects/application/use-cases/create-project/create-project.use-case';
import { ToggleFavoriteUseCase } from '@features/projects/application/use-cases/toggle-favorite/toggle-favorite.use-case';
import { DeleteProjectUseCase } from '@features/projects/application/use-cases/delete-project/delete-project.use-case';
import { SectionStore } from './section.store';
import { TaskStore } from './task.store';
import { ProjectSummaryStore } from './project-summary.store';
import { ProjectEventsService } from '@features/projects/infrastructure/services/project-events.service';
import { UserEventsService } from '@features/projects/infrastructure/services/user-events.service';
import { Project } from '@features/projects/domain/entities/project.entity';
import { ProjectName } from '@features/projects/domain/value-objects/project-name.value-object';

describe('ProjectStore', () => {
  let store: ProjectStore;
  const loadAllExecute = vi.fn();
  const loadProjectExecute = vi.fn();
  const mergePendingCounts = vi.fn();
  const removePendingCount = vi.fn();
  const mergeSections = vi.fn();
  const mergeTasks = vi.fn();
  const toggleFavoriteExecute = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    loadAllExecute.mockReturnValue(of([]));
    loadProjectExecute.mockReturnValue(
      of({
        project: new Project('p1', ProjectName.create('First'), false, []),
        sections: [],
        tasks: [],
      }),
    );
    toggleFavoriteExecute.mockReturnValue(of(void 0));

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ProjectStore,
        { provide: LoadProjectUseCase, useValue: { execute: loadProjectExecute } },
        { provide: LoadAllProjectsUseCase, useValue: { execute: loadAllExecute } },
        { provide: CreateProjectUseCase, useValue: { execute: vi.fn() } },
        { provide: ToggleFavoriteUseCase, useValue: { execute: toggleFavoriteExecute } },
        { provide: DeleteProjectUseCase, useValue: { execute: vi.fn().mockReturnValue(of(void 0)) } },
        {
          provide: SectionStore,
          useValue: {
            mergeSections,
            createSection: vi.fn(),
            getSection: vi.fn(),
            addTaskToSection: vi.fn(),
            removeSection: vi.fn(),
            removeTaskFromSection: vi.fn(),
          },
        },
        {
          provide: TaskStore,
          useValue: {
            mergeTasks,
            createTask: vi.fn(),
            createSubtask: vi.fn(),
            toggleTaskCompletion: vi.fn(),
            removeTask: vi.fn(),
          },
        },
        {
          provide: ProjectSummaryStore,
          useValue: { mergePendingCounts, removePendingCount },
        },
        { provide: ProjectEventsService, useValue: { connect: vi.fn().mockReturnValue(of()) } },
        { provide: UserEventsService, useValue: { connect: vi.fn().mockReturnValue(of()) } },
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

  it('toggleProjectFavorite optimistically flips favorite and calls use case', () => {
    loadAllExecute.mockReturnValue(
      of([{ project: new Project('p1', ProjectName.create('First'), false, []), pendingCount: 0 }]),
    );
    store.loadAllProjects();
    loadProjectExecute.mockClear();
    vi.clearAllMocks();

    store.toggleProjectFavorite('p1');
    const updated = store.projects().find((p) => p.id === 'p1');
    expect(updated?.favorite).toBe(true);
    expect(toggleFavoriteExecute).toHaveBeenCalledWith('p1', true);
  });
});
