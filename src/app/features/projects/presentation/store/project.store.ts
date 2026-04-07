import { computed, inject, Injectable, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoadProjectUseCase } from '@features/projects/application/use-cases/projects/load-project/load-project.use-case';
import { LoadAllProjectsUseCase } from '@features/projects/application/use-cases/projects/load-all-projects/load-all-projects.use-case';
import { CreateProjectInput, CreateProjectUseCase } from '@features/projects/application/use-cases/projects/create-project/create-project.use-case';
import { ToggleFavoriteUseCase } from '@features/projects/application/use-cases/projects/toggle-favorite/toggle-favorite.use-case';
import { DeleteProjectUseCase } from '@features/projects/application/use-cases/projects/delete-project/delete-project.use-case';
import { UpdateProjectInput, UpdateProjectUseCase } from '@features/projects/application/use-cases/projects/update-project/update-project.use-case';
import { initialProjectState, ProjectState } from '@features/projects/presentation/models/project-state';
import { ProjectOutput } from '@features/projects/application/dtos/project-output';
import {
  ProjectViewModel,
  SectionViewModel,
  TaskViewModel,
} from '@features/projects/presentation/models/project.view-model';
import { SectionStore } from '@features/projects/presentation/store/section.store';
import { TaskStore } from '@features/projects/presentation/store/task.store';
import { ProjectSummaryStore } from '@features/projects/presentation/store/project-summary.store';
import { ProjectEventsService } from '@features/projects/infrastructure/services/project-events.service';
import { UserEventsService } from '@features/projects/infrastructure/services/user-events.service';
import { ProjectEvent, DeletePayload } from '@features/projects/infrastructure/dto/sse/project-event';
import { UserEvent, ProjectDeletePayload } from '@features/projects/infrastructure/dto/sse/user-event';
import { ProjectSummaryDto } from '@features/projects/infrastructure/dto/response/project-summary.dto';
import { Section } from '@features/projects/domain/entities/section.entity';
import { SectionMapper } from '@features/projects/infrastructure/mappers/section.mapper';
import { TaskMapper } from '@features/projects/infrastructure/mappers/task.mapper';
import { SectionDto } from '@features/projects/infrastructure/dto/section.dto';
import { TaskDto } from '@features/projects/infrastructure/dto/task.dto';
import { ProjectsError } from '@features/projects/application/errors/projects.error';
import { toProjectsUiError } from '@features/projects/presentation/mappers/projects-ui-error.mapper';

/**
 * Store for **projects** only.
 *
 * Owns `ProjectState` (projects dictionary + selectedProjectId).
 * Delegates section operations to {@link SectionStore} and task
 * operations to {@link TaskStore}.
 *
 * The `projectView` computed signal reads across all three stores
 * to build the denormalized tree the template needs.
 */
@Injectable({ providedIn: 'root' })
export class ProjectStore {
  // --------------- Use-case injection ---------------
  private readonly loadProjectUseCase   = inject(LoadProjectUseCase);
  private readonly loadAllProjectsUseCase = inject(LoadAllProjectsUseCase);
  private readonly createProjectUseCase = inject(CreateProjectUseCase);
  private readonly toggleFavoriteUseCase = inject(ToggleFavoriteUseCase);
  private readonly deleteProjectUseCase = inject(DeleteProjectUseCase);
  private readonly updateProjectUseCase = inject(UpdateProjectUseCase);

  // --------------- Peer stores ---------------
  private readonly sectionStore         = inject(SectionStore);
  private readonly taskStore            = inject(TaskStore);
  private readonly projectSummaryStore  = inject(ProjectSummaryStore);

  // --------------- SSE ---------------
  private readonly projectEventsService = inject(ProjectEventsService);
  private readonly userEventsService = inject(UserEventsService);
  private projectEventsSubscription?: Subscription;
  private userEventsSubscription?: Subscription;

  // --------------- State signal ---------------
  private readonly state = signal<ProjectState>(initialProjectState);

  // ===================================================================
  // SELECTORS — flat (normalized) reads
  // ===================================================================

  /** All projects as an array */
  readonly projects = computed(() => Object.values(this.state().projects));

  /** Currently selected project ID */
  readonly selectedProjectId = computed(() => this.state().selectedProjectId);

  /** Currently selected project entity (or null) */
  readonly selectedProject = computed(() => {
    const id = this.state().selectedProjectId;
    return id ? (this.state().projects[id] ?? null) : null;
  });

  /** Loading flag */
  readonly loading = computed(() => this.state().loading);

  /** Last error */
  readonly error = computed(() => this.state().error);

  // ===================================================================
  // SELECTORS — denormalized view-model for the UI
  // ===================================================================

  /**
   * Denormalized view of the selected project.
   * Reads from ProjectStore, SectionStore, and TaskStore to build
   * the full `ProjectViewModel` tree (including subtasks).
   */
  readonly projectView = computed<ProjectViewModel | null>(() => {
    const project = this.selectedProject();
    if (!project) return null;

    const sections = this.sectionStore.sections();
    const tasks = this.taskStore.tasks();

    /** Recursively build TaskViewModel tree from a flat tasks dict */
    const buildTaskTree = (taskIds: readonly string[]): TaskViewModel[] =>
      taskIds
        .map(tId => tasks[tId])
        .filter(Boolean)
        .map(task => ({
          id: task.id,
          name: task.name,
          completed: task.completed,
          startDate: task.startDate,
          subtasks: buildTaskTree(task.subtaskIds),
        }));

    const sectionViewModels: SectionViewModel[] = project.sectionIds
      .map(sectionId => sections[sectionId])
      .filter((s): s is Section => !!s)
      .map(section => ({
        id: section.id,
        name: section.name,
        taskCount: section.taskIds.length,
        tasks: buildTaskTree(section.taskIds),
      }));

    return {
      id: project.id,
      name: project.name,
      sections: sectionViewModels,
    };
  });

  // ===================================================================
  // ACTIONS — Project
  // ===================================================================

  /**
   * Clear loading state and errors before starting a new request.
   */
  private clearState(): void {
    this.state.update(s => ({
      ...s,
      loading: true,
      error: null,
    }));
  }

  /** Insert or replace a project in the dictionary. */
  private upsertProject(id: string, project: ProjectOutput): void {
    this.state.update(s => ({
      ...s,
      projects: { ...s.projects, [id]: project },
    }));
  }

  /** Remove a project from the dictionary by id. */
  private removeProject(id: string): void {
    this.state.update(s => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [id]: _, ...rest } = s.projects;
      return { ...s, projects: rest };
    });
  }

  /** Record an error in the store and log it to the console. */
  private setError(message: string, context: string, error: unknown): void {
    this.state.update(s => ({ ...s, error: message }));
    console.error(`Failed to ${context}:`, error);
  }

  private setResultError(error: ProjectsError, context: string): void {
    const uiError = toProjectsUiError(error);
    this.setError(uiError.message, context, error);
  }

  /**
   * Create a new project with **optimistic UI**.
   *
   * A temporary project is added to the store immediately so the user
   * sees it without waiting for the backend round-trip.  Once the
   * server responds the temporary entry is swapped for the real one;
   * on failure the optimistic entry is rolled back.
   */
  createProject(input: CreateProjectInput): void {
    const tempId = `temp-${Date.now()}`;
    const optimisticProject: ProjectOutput = {
      id: tempId,
      name: input.name,
      favorite: input.favorite,
      sectionIds: [],
    };

    // Show the project in the UI right away
    this.upsertProject(tempId, optimisticProject);
    this.projectSummaryStore.mergePendingCounts({ [tempId]: 0 });

    // Fire the backend request in parallel
    this.createProjectUseCase.execute(input).subscribe({
      next: (result) => {
        if (!result.success) {
          // Revert the optimistic update
          this.removeProject(tempId);
          this.projectSummaryStore.removePendingCount(tempId);
          this.setResultError(result.error, 'create project');
          return;
        }

        const project = result.value;
        // Replace the temp project with the real one from the backend
        this.removeProject(tempId);
        this.upsertProject(project.id, project);
        this.projectSummaryStore.removePendingCount(tempId);
        this.projectSummaryStore.mergePendingCounts({ [project.id]: 0 });
      },
    });
  }

  /**
   * Update an existing project's name and/or favorite status with **optimistic UI**.
   *
   * The store is updated immediately so the user sees the change without delay.
   * If the backend call fails the original state is restored.
   */
  updateProject(input: UpdateProjectInput): void {
    const existing = this.state().projects[input.id];
    if (!existing) return;

    const optimistic: ProjectOutput = {
      ...existing,
      name: input.name,
      favorite: input.favorite,
    };

    this.upsertProject(input.id, optimistic);

    this.updateProjectUseCase.execute(input).subscribe({
      next: (result) => {
        if (!result.success) {
          this.upsertProject(input.id, existing);
          this.setResultError(result.error, 'update project');
          return;
        }

        const updated = result.value;
        this.upsertProject(updated.id, { ...existing, name: updated.name, favorite: input.favorite });
      },
    });
  }

  /**
   * Load a full project (with sections & tasks) from the API,
   * then distribute the normalized data to each store.
   * Opens an SSE connection for live updates from other users.
   */
  loadProject(projectId: string): void {
    this.disconnectFromProjectEvents();
    this.clearState();
    this.state.update(s => ({
      ...s,
      selectedProjectId: projectId,
    }));

    this.loadProjectUseCase.execute(projectId).subscribe({
      next: ({ project, sections, tasks }) => {
        this.sectionStore.mergeSections(sections);
        this.taskStore.mergeTasks(tasks);

        this.upsertProject(project.id, project);
        this.state.update(s => ({
          ...s,
          loading: false,
        }));

        this.connectToProjectEvents(projectId);
      },
      error: (error) => {
        this.state.update(s => ({ ...s, loading: false }));
        this.setError(error.message, 'load project', error);
      },
    });
  }

  /**
   * Load all projects from the API and populate the store.
   * This is called after making a successful login.
   */
  loadAllProjects(): void {
    this.clearState();
    this.connectToUserEvents();

    this.loadAllProjectsUseCase.execute().subscribe({
      next: (summaries) => {
        const projectsDict: Record<string, ProjectOutput> = {};
        const pendingCounts: Record<string, number> = {};

        for (const { project, pendingCount } of summaries) {
          projectsDict[project.id] = project;
          pendingCounts[project.id] = pendingCount;
        }

        this.projectSummaryStore.mergePendingCounts(pendingCounts);

        // `loadAllProjects()` returns summaries (no sections yet => `sectionIds: []`).
        // If a full `loadProject()` already happened for some id (e.g. navigating directly
        // to `/projects/:id` on reload), we must not overwrite its `sectionIds`.
        this.state.update(s => {
          const mergedProjects: Record<string, ProjectOutput> = { ...projectsDict };
          for (const [id, existing] of Object.entries(s.projects)) {
            const incoming = mergedProjects[id];
            if (!incoming) continue;
            if (existing.sectionIds.length > 0) {
              mergedProjects[id] = { ...incoming, sectionIds: existing.sectionIds };
            }
          }

          return {
            ...s,
            projects: mergedProjects,
            loading: false,
          };
        });

        // Auto-select the first project if none is selected yet
        const ids = Object.keys(projectsDict);
        if (!this.state().selectedProjectId && ids.length > 0) {
          this.loadProject(ids[0]);
        }
      },
      error: (error) => {
        this.state.update(s => ({ ...s, loading: false }));
        this.setError(error.message, 'load all projects', error);
      },
    });
  }

  /**
   * Toggle a project's favorite status with **optimistic UI**.
   *
   * The store is updated immediately so the user sees the change
   * without delay.  If the backend call fails the original state
   * is restored.
   */
  toggleProjectFavorite(projectId: string): void {
    const project = this.state().projects[projectId];
    if (!project) return;

    const toggledFavorite = !project.favorite;
    const toggled: ProjectOutput = { ...project, favorite: toggledFavorite };

    // Update the UI immediately
    this.upsertProject(projectId, toggled);

    // Then call the backend
    this.toggleFavoriteUseCase.execute(projectId, toggledFavorite).subscribe({
      error: (error) => {
        // Revert to the original project on failure
        this.upsertProject(projectId, project);
        this.setError(error.message, 'toggle favorite', error);
      },
    });
  }

  /**
   * Delete a project with **optimistic UI**.
   *
   * The project is removed from the store immediately.
   * If the backend call fails the project is restored.
   * When the deleted project was the selected one, the first
   * remaining project is auto-selected.
   */
  deleteProject(projectId: string): void {
    const project = this.state().projects[projectId];
    if (!project) return;

    this.removeProject(projectId);
    this.projectSummaryStore.removePendingCount(projectId);

    if (this.state().selectedProjectId === projectId) {
      // We are deleting the currently-open project; close its SSE stream immediately
      // so the browser doesn't keep a live connection to a project that no longer exists.
      this.disconnectFromProjectEvents();

      const ids = Object.keys(this.state().projects);
      if (ids.length > 0) {
        // RELOAD: First project in list when we delete a project
        this.loadProject(ids[0]);
      } else {
        this.state.update(s => ({ ...s, selectedProjectId: null }));
      }
    }

    this.deleteProjectUseCase.execute(projectId).subscribe({
      error: (error) => {
        this.upsertProject(projectId, project);
        this.setError(error.message, 'delete project', error);
      },
    });
  }

  // ===================================================================
  // ACTIONS — Section (delegated)
  // ===================================================================

  /** Update a section's name (optimistic, delegates to SectionStore) */
  updateSectionName(sectionId: string, newName: string): void {
    this.sectionStore.updateSection(sectionId, newName);
  }

  /**
   * Delete a section from the currently selected project (optimistic).
   * Removes the sectionId from the project's `sectionIds` and delegates
   * the HTTP call to SectionStore.
   */
  deleteSectionFromProject(sectionId: string): void {
    const projectId = this.state().selectedProjectId;
    if (!projectId) return;

    this.sectionStore.deleteSection(projectId, sectionId, () => {
      const existing = this.state().projects[projectId];
      if (!existing) return;
      this.upsertProject(projectId, {
        ...existing,
        sectionIds: existing.sectionIds.filter(id => id !== sectionId),
      });
    });
  }

  /** Create a section inside the currently selected project */
  createSection(sectionName: string): void {
    const projectId = this.state().selectedProjectId;
    if (!projectId) {
      console.error('Cannot create section: no project selected');
      return;
    }

    // Keep ProjectOutput.sectionIds in sync so the UI doesn't need to scan every section.
    this.sectionStore.createSection(projectId, sectionName, (section) => {
      const existing = this.state().projects[projectId];
      if (!existing) return;
      if (existing.sectionIds.includes(section.id)) return;

      this.upsertProject(projectId, {
        ...existing,
        sectionIds: [...existing.sectionIds, section.id],
      });
    });
  }

  // ===================================================================
  // ACTIONS — Task (delegated)
  // ===================================================================

  /** Create a task inside a given section */
  createTask(sectionId: string, taskName: string): void {
    const projectId = this.state().selectedProjectId;
    if (!projectId) {
      console.error('Cannot create task: no project selected');
      return;
    }

    this.taskStore.createTask(projectId, sectionId, taskName, (task) => {
      // Link the new task to the section
      this.sectionStore.addTaskToSection(sectionId, task.id);
    });
  }

  /** Create a subtask under an existing task */
  createSubtask(parentTaskId: string, sectionId: string, taskName: string): void {
    const projectId = this.state().selectedProjectId;
    if (!projectId) {
      console.error('Cannot create subtask: no project selected');
      return;
    }

    this.taskStore.createSubtask(parentTaskId, projectId, sectionId, taskName);
  }

  /** Toggle a task's completed status */
  toggleTaskCompletion(taskId: string): void {
    this.taskStore.toggleTaskCompletion(taskId);
  }

  /** Update a task name */
  updateTaskName(taskId: string, name: string): void {
    const projectId = this.state().selectedProjectId;
    if (!projectId) {
      console.error('Cannot update task: no project selected');
      return;
    }

    this.taskStore.updateTaskName(projectId, taskId, name);
  }

  /** Delete a task from section */
  deleteTask(sectionId: string, taskId: string): void {
    const projectId = this.state().selectedProjectId;
    if (!projectId) {
      console.error('Cannot delete task: no project selected');
      return;
    }

    this.taskStore.deleteTask(projectId, sectionId, taskId, () => {
      this.sectionStore.removeTaskFromSection(sectionId, taskId);
    });
  }

  // ===================================================================
  // SSE — real-time updates from other users
  // ===================================================================

  // --- Project channel (per-project, rotates on project change) ---

  private connectToProjectEvents(projectId: string): void {
    this.projectEventsSubscription = this.projectEventsService
      .connect(projectId)
      .subscribe(event => this.handleProjectEvent(event, projectId));
  }

  private disconnectFromProjectEvents(): void {
    this.projectEventsSubscription?.unsubscribe();
    this.projectEventsSubscription = undefined;
  }

  // --- User channel (session-wide, open from login to logout) ---

  private connectToUserEvents(): void {
    this.userEventsSubscription?.unsubscribe();
    this.userEventsSubscription = this.userEventsService
      .connect()
      .subscribe(event => this.handleUserEvent(event));
  }

  private disconnectFromUserEvents(): void {
    this.userEventsSubscription?.unsubscribe();
    this.userEventsSubscription = undefined;
  }

  /** Close all SSE connections. Call on logout / navigation away. */
  disconnectFromEvents(): void {
    this.disconnectFromProjectEvents();
    this.disconnectFromUserEvents();
  }

  // --- Event handlers ---

  private handleUserEvent(event: UserEvent): void {
    switch (event.type) {
      case 'project_created': {
        const dto = event.data as ProjectSummaryDto;
        const projectId = String(dto.id);
        if (!this.state().projects[projectId]) {
          const project: ProjectOutput = {
            id: projectId,
            name: dto.name,
            favorite: dto.favorite,
            sectionIds: [],
          };
          this.upsertProject(projectId, project);
          this.projectSummaryStore.mergePendingCounts({ [projectId]: dto.pendingCount });
        }
        break;
      }

      case 'project_updated': {
        const dto = event.data as ProjectSummaryDto;
        const projectId = String(dto.id);
        const existing = this.state().projects[projectId];
        if (existing) {
          this.upsertProject(projectId, {
            ...existing,
            name: dto.name,
            favorite: dto.favorite,
          });
          this.projectSummaryStore.mergePendingCounts({ [projectId]: dto.pendingCount });
        }
        break;
      }

      case 'project_deleted': {
        const { id } = event.data as ProjectDeletePayload;
        const projectId = String(id);
        this.removeProject(projectId);
        this.projectSummaryStore.removePendingCount(projectId);
        if (this.state().selectedProjectId === projectId) {
          // The currently-open project was deleted elsewhere; close the per-project SSE stream.
          this.disconnectFromProjectEvents();
          const ids = Object.keys(this.state().projects);
          if (ids.length > 0) {
            this.loadProject(ids[0]);
          }
        }
        break;
      }
    }
  }

  private handleProjectEvent(event: ProjectEvent, projectId: string): void {
    switch (event.type) {
      case 'section_created': {
        const dto = event.data as SectionDto;
        const section = SectionMapper.toDomain(dto, projectId);
        this.sectionStore.mergeSections([section]);

        const existing = this.state().projects[projectId];
        if (existing && !existing.sectionIds.includes(section.id)) {
          this.upsertProject(projectId, {
            ...existing,
            sectionIds: [...existing.sectionIds, section.id],
          });
        }
        break;
      }

      case 'section_updated': {
        const dto = event.data as SectionDto;
        const section = SectionMapper.toDomain(dto, projectId);
        this.sectionStore.mergeSections([section]);
        break;
      }

      case 'section_deleted': {
        const { id } = event.data as DeletePayload;
        const sectionId = String(id);
        this.sectionStore.removeSection(sectionId);

        const existing = this.state().projects[projectId];
        if (existing?.sectionIds.includes(sectionId)) {
          this.upsertProject(projectId, {
            ...existing,
            sectionIds: existing.sectionIds.filter((sId) => sId !== sectionId),
          });
        }
        break;
      }

      case 'task_created': {
        const dto = event.data as TaskDto;
        const rawSectionId = (event.data as Record<string, unknown>)['sectionId'];
        const sectionId = typeof rawSectionId === 'string' || typeof rawSectionId === 'number'
          ? String(rawSectionId)
          : String(dto.id);
        const taskId = String(dto.id);
        const tasks = TaskMapper.flattenToDomain(dto, sectionId);
        this.taskStore.mergeTasks(tasks);
        const section = this.sectionStore.getSection(sectionId);
        if (section && !section.taskIds.includes(taskId)) {
          this.sectionStore.addTaskToSection(sectionId, taskId);
        }
        break;
      }

      case 'task_updated': {
        const dto = event.data as TaskDto;
        const sectionId = String((event.data as Record<string, unknown>)['sectionId']);
        const tasks = TaskMapper.flattenToDomain(dto, sectionId);
        this.taskStore.mergeTasks(tasks);
        break;
      }

      case 'task_deleted': {
        const { id, sectionId } = event.data as DeletePayload;
        const taskId = String(id);
        if (sectionId) {
          this.sectionStore.removeTaskFromSection(String(sectionId), taskId);
        }
        this.taskStore.removeTask(taskId);
        break;
      }
    }
  }
}
