import { computed, inject, Injectable, signal } from '@angular/core';
import { LoadProjectUseCase } from '../../application/use-cases/load-project.use-case';
import { CreateProjectUseCase } from '../../application/use-cases/create-project.use-case';
import { CreateSectionUseCase } from '../../application/use-cases/create-section.use-case';
import { CreateTaskUseCase } from '../../application/use-cases/create-task.use-case';
import { ToggleTaskCompletionUseCase } from '../../application/use-cases/toggle-task-completion.use-case';
import { initialProjectState, ProjectState } from '../models/project-state';
import { ProjectDto } from '../../infrastructure/dto/project.dto';
import {
  ProjectViewModel,
  SectionViewModel,
  TaskViewModel,
} from '../models/project.view-model';

/**
 * Central **normalized** state store for the Projects feature.
 *
 * State shape (see {@link ProjectState}):
 * ```
 * {
 *   projects:          Record<string, Project>,
 *   sections:          Record<string, Section>,
 *   tasks:             Record<string, Task>,
 *   selectedProjectId: string | null,
 *   loading:           boolean,
 *   error:             string | null,
 * }
 * ```
 *
 * Relationships live as ID arrays inside the entities themselves
 * (`Project.sectionIds`, `Section.taskIds`), while computed selectors
 * denormalize on-the-fly for the UI via Angular signals.
 */
@Injectable({ providedIn: 'root' })
export class ProjectStore {
  // --------------- Use-case injection ---------------
  private readonly loadProjectUseCase = inject(LoadProjectUseCase);
  private readonly createProjectUseCase = inject(CreateProjectUseCase);
  private readonly createSectionUseCase = inject(CreateSectionUseCase);
  private readonly createTaskUseCase = inject(CreateTaskUseCase);
  private readonly toggleTaskUseCase = inject(ToggleTaskCompletionUseCase);

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
  // SELECTORS — denormalized view-models for the UI
  // ===================================================================

  /**
   * Denormalized view of the selected project, ready for the template.
   * Reconstructs the `ProjectViewModel` tree from the flat dictionaries.
   */
  readonly projectView = computed<ProjectViewModel | null>(() => {
    const project = this.selectedProject();
    if (!project) return null;

    const { sections, tasks } = this.state();

    const sectionViewModels: SectionViewModel[] = project.sectionIds
      .map((sId) => sections[sId])
      .filter(Boolean)
      .map((section) => ({
        id: section.id,
        name: section.name,
        tasks: section.taskIds
          .map((tId) => tasks[tId])
          .filter(Boolean)
          .map((task) => ({
            id: task.id,
            name: task.name,
            completed: task.completed,
            startDate: task.startDate,
          })),
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

  /** Create a new project and add it to the store */
  createProject(projectDto: ProjectDto): void {
    this.createProjectUseCase.execute(projectDto).subscribe({
      next: (project) => {
        this.state.update((s) => ({
          ...s,
          projects: { ...s.projects, [project.id]: project },
        }));
      },
      error: (error) => {
        this.state.update((s) => ({ ...s, error: error.message }));
        console.error('Failed to create project:', error);
      },
    });
  }

  /** Load a full project (with sections & tasks) and normalize it into state */
  loadProject(projectId: string): void {
    this.state.update((s) => ({
      ...s,
      loading: true,
      error: null,
      selectedProjectId: projectId,
    }));

    this.loadProjectUseCase.execute(projectId).subscribe({
      next: ({ project, sections, tasks }) => {
        const sectionMap: Record<string, (typeof sections)[number]> = {};
        const taskMap: Record<string, (typeof tasks)[number]> = {};

        for (const section of sections) {
          sectionMap[section.id] = section;
        }
        for (const task of tasks) {
          taskMap[task.id] = task;
        }

        this.state.update((s) => ({
          ...s,
          projects: { ...s.projects, [project.id]: project },
          sections: { ...s.sections, ...sectionMap },
          tasks: { ...s.tasks, ...taskMap },
          loading: false,
        }));
      },
      error: (error) => {
        this.state.update((s) => ({
          ...s,
          loading: false,
          error: error.message,
        }));
        console.error('Failed to load project:', error);
      },
    });
  }

  // ===================================================================
  // ACTIONS — Section
  // ===================================================================

  /** Create a section inside the currently selected project */
  createSection(sectionName: string): void {
    const projectId = this.state().selectedProjectId;
    if (!projectId) {
      console.error('Cannot create section: no project selected');
      return;
    }

    this.createSectionUseCase.execute(projectId, sectionName).subscribe({
      next: (section) => {
        this.state.update((s) => {
          const project = s.projects[projectId];
          if (!project) return s;

          return {
            ...s,
            projects: {
              ...s.projects,
              [projectId]: project.addSection(section.id),
            },
            sections: { ...s.sections, [section.id]: section },
          };
        });
      },
      error: (error) => {
        this.state.update((s) => ({ ...s, error: error.message }));
        console.error('Failed to create section:', error);
      },
    });
  }

  // ===================================================================
  // ACTIONS — Task
  // ===================================================================

  /** Create a task inside a given section */
  createTask(sectionId: string, taskName: string): void {
    this.createTaskUseCase.execute(sectionId, taskName).subscribe({
      next: (task) => {
        this.state.update((s) => {
          const section = s.sections[sectionId];
          if (!section) return s;

          return {
            ...s,
            sections: {
              ...s.sections,
              [sectionId]: section.addTask(task.id),
            },
            tasks: { ...s.tasks, [task.id]: task },
          };
        });
      },
      error: (error) => {
        this.state.update((s) => ({ ...s, error: error.message }));
        console.error('Failed to create task:', error);
      },
    });
  }

  /** Toggle a task's completed status */
  toggleTaskCompletion(taskId: string): void {
    this.toggleTaskUseCase.execute(taskId).subscribe({
      next: (updatedTask) => {
        this.state.update((s) => ({
          ...s,
          tasks: { ...s.tasks, [updatedTask.id]: updatedTask },
        }));
      },
      error: (error) => {
        this.state.update((s) => ({ ...s, error: error.message }));
        console.error('Failed to toggle task:', error);
      },
    });
  }
}
