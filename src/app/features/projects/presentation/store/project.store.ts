import { computed, inject, Injectable, signal } from '@angular/core';
import { LoadProjectUseCase } from '../../application';
import { Project, Section, Task } from '../../domain';
import { ProjectViewModel } from '../models/project.view-model';

export interface ProjectState {
  project: Project | null;
  sections: Record<string, Section>;
  tasks: Record<string, Task>;
}

@Injectable()
export class ProjectStore {
  private loadProjectUseCase = inject(LoadProjectUseCase);

  private readonly state = signal<ProjectState>({
    project: null,
    sections: {},
    tasks: {},
  });

  readonly project = computed(() => this.state().project);
  readonly sections = computed(() => this.state().sections);
  readonly tasks = computed(() => this.state().tasks);

  readonly projectView = computed<ProjectViewModel | null>(() => {
    const { project, sections, tasks } = this.state();
    if (!project) return null;

    return {
      id: project.id,
      name: project.name,
      sections: project.sectionIds
        .map(id => sections[id])
        .filter(Boolean)
        .map(section => ({
          id: section.id,
          name: section.name,
          tasks: section.taskIds
            .map(id => tasks[id])
            .filter(Boolean)
            .map(task => ({
              id: task.id,
              name: task.name,
              completed: task.completed,
              startDate: task.startDate,
            })),
        })),
    };
  });

  loadProject(projectId: string): void {
    this.state.set({
      project: null,
      sections: {},
      tasks: {},
    });

    this.loadProjectUseCase.execute(projectId).subscribe({
      next: ({ project, sections, tasks }) => {
        this.state.set({
          project,
          sections: this.toRecord(sections),
          tasks: this.toRecord(tasks),
        });
      },
      error: (error) => {
        console.error('Failed to load project:', error);
      },
    });
  }

  private toRecord<T extends { id: string }>(items: T[]): Record<string, T> {
    return items.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {} as Record<string, T>);
  }
}
