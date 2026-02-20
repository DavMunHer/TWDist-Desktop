import { computed, inject, Injectable, signal } from '@angular/core';
import { LoadProjectUseCase } from '../../application/use-cases/load-project.use-case';
import { LoadAllProjectsUseCase } from '../../application/use-cases/load-all-projects.use-case';
import { CreateProjectUseCase } from '../../application/use-cases/create-project.use-case';
import { ToggleFavoriteUseCase } from '../../application/use-cases/toggle-favorite.use-case';
import { initialProjectState, ProjectState } from '../models/project-state';
import { ProjectDto } from '../../infrastructure/dto/project.dto';
import {
  ProjectViewModel,
  SectionViewModel,
  TaskViewModel,
} from '../models/project.view-model';
import { SectionStore } from './section.store';
import { TaskStore } from './task.store';
import { ProjectSummaryStore } from './project-summary.store';
import { Task } from '../../domain/entities/task.entity';
import { Project } from '../../domain/entities/project.entity';

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

  // --------------- Peer stores ---------------
  private readonly sectionStore         = inject(SectionStore);
  private readonly taskStore            = inject(TaskStore);
  private readonly projectSummaryStore  = inject(ProjectSummaryStore);

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
    const tasks    = this.taskStore.tasks();

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
      .map(sId => sections[sId])
      .filter(Boolean)
      .map(section => ({
        id: section.id,
        name: section.name,
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

  /**
   * Create a new project with **optimistic UI**.
   *
   * A temporary project is added to the store immediately so the user
   * sees it without waiting for the backend round-trip.  Once the
   * server responds the temporary entry is swapped for the real one;
   * on failure the optimistic entry is rolled back.
   */
  createProject(projectDto: ProjectDto): void {
    const tempId = `temp-${Date.now()}`;
    const optimisticProject = new Project(
      tempId,
      projectDto.name,
      projectDto.favorite,
      [],
    );

    // Show the project in the UI right away
    this.state.update(s => ({
      ...s,
      projects: { ...s.projects, [tempId]: optimisticProject },
    }));
    this.projectSummaryStore.mergePendingCounts({ [tempId]: 0 });

    // Fire the backend request in parallel
    this.createProjectUseCase.execute(projectDto).subscribe({
      next: (project) => {
        // Replace the temp project with the real one from the backend
        this.state.update(s => {
          const { [tempId]: _, ...rest } = s.projects;
          return {
            ...s,
            projects: { ...rest, [project.id]: project },
          };
        });
        this.projectSummaryStore.removePendingCount(tempId);
        this.projectSummaryStore.mergePendingCounts({ [project.id]: 0 });
      },
      error: (error) => {
        // Revert the optimistic update
        this.state.update(s => {
          const { [tempId]: _, ...rest } = s.projects;
          return { ...s, projects: rest, error: error.message };
        });
        this.projectSummaryStore.removePendingCount(tempId);
        console.error('Failed to create project:', error);
      },
    });
  }

  /**
   * Load a full project (with sections & tasks) from the API,
   * then distribute the normalized data to each store.
   */
  loadProject(projectId: string): void {
    this.clearState();
    this.state.update(s => ({
      ...s,
      selectedProjectId: projectId,
    }));

    this.loadProjectUseCase.execute(projectId).subscribe({
      next: ({ project, sections, tasks }) => {
        // Distribute to peer stores
        this.sectionStore.mergeSections(sections);
        this.taskStore.mergeTasks(tasks);

        // Update own state
        this.state.update(s => ({
          ...s,
          projects: { ...s.projects, [project.id]: project },
          loading: false,
        }));
      },
      error: (error) => {
        this.state.update(s => ({ ...s, loading: false, error: error.message }));
        console.error('Failed to load project:', error);
      },
    });
  }

  /**
   * Load all projects from the API and populate the store.
   * This is called after making a successful login.
   */
  loadAllProjects(): void {
    this.clearState();

    this.loadAllProjectsUseCase.execute().subscribe({
      next: (summaries) => {
        const projectsDict: Record<string, Project> = {};
        const pendingCounts: Record<string, number> = {};

        for (const { project, pendingCount } of summaries) {
          projectsDict[project.id] = project;
          pendingCounts[project.id] = pendingCount;
        }

        this.projectSummaryStore.mergePendingCounts(pendingCounts);

        this.state.update(s => ({
          ...s,
          projects: projectsDict,
          loading: false,
        }));
      },
      error: (error) => {
        this.state.update(s => ({ ...s, loading: false, error: error.message }));
        console.error('Failed to load all projects:', error);
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

    const toggled = project.toggleFavorite();

    // Update the UI immediately
    this.state.update(s => ({
      ...s,
      projects: { ...s.projects, [projectId]: toggled },
    }));

    // Then call the backend
    this.toggleFavoriteUseCase.execute(projectId, toggled.favorite).subscribe({
      error: (error) => {
        // Revert to the original project on failure
        this.state.update(s => ({
          ...s,
          projects: { ...s.projects, [projectId]: project },
          error: error.message,
        }));
        console.error('Failed to toggle favorite:', error);
      },
    });
  }

  // ===================================================================
  // ACTIONS — Section (delegated)
  // ===================================================================

  /** Create a section inside the currently selected project */
  createSection(sectionName: string): void {
    const projectId = this.state().selectedProjectId;
    if (!projectId) {
      console.error('Cannot create section: no project selected');
      return;
    }

    this.sectionStore.createSection(projectId, sectionName, (section) => {
      // Link the new section to the project
      this.state.update(s => {
        const project = s.projects[projectId];
        if (!project) return s;

        return {
          ...s,
          projects: {
            ...s.projects,
            [projectId]: project.addSection(section.id),
          },
        };
      });
    });
  }

  // ===================================================================
  // ACTIONS — Task (delegated)
  // ===================================================================

  /** Create a task inside a given section */
  createTask(sectionId: string, taskName: string): void {
    this.taskStore.createTask(sectionId, taskName, (task) => {
      // Link the new task to the section
      this.sectionStore.addTaskToSection(sectionId, task.id);
    });
  }

  /** Create a subtask under an existing task */
  createSubtask(parentTaskId: string, sectionId: string, taskName: string): void {
    this.taskStore.createSubtask(parentTaskId, sectionId, taskName);
  }

  /** Toggle a task's completed status */
  toggleTaskCompletion(taskId: string): void {
    this.taskStore.toggleTaskCompletion(taskId);
  }
}
