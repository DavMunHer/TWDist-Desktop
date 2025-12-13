import { computed, inject, Injectable, signal } from '@angular/core';
import { ProjectView } from '../../models/model-views/view.types';
import { ProjectApiService } from '../../core/api/project-api.service';
import { ProjectState } from './project.state';
import { toRecord } from '../utils/normalize';

@Injectable({
  providedIn: 'root',
})
export class ProjectStoreService {
  private projectApi = inject(ProjectApiService);

  private readonly state = signal<ProjectState>({
    project: null,
    sections: {},
    tasks: {},
  });

  readonly project = computed(() => this.state().project);
  readonly sections = computed(() => this.state().sections);
  readonly tasks = computed(() => this.state().tasks);

  readonly projectView = computed<ProjectView | null>(() => {
    const { project, sections, tasks } = this.state();
    if (!project) return null;

    return {
      id: project.id,
      name: project.name,
      sectionsList: project.sectionIds
        .map((id) => sections[id])
        .filter(Boolean) // Keeping only the truthy values
        .map((section) => ({
          id: section.id,
          name: section.name,
          tasksList: section.tasksIds
            .map((id) => tasks[id])
            .filter(Boolean)
            .map((task) => ({
              id: task.id,
              taskName: task.taskName,
              completed: task.completed,
              startDate: task.startDate,
            })),
        })),
    };
  });

  loadProject(projectId: string) {
    this.state.set({
      project: null,
      sections: {},
      tasks: {},
    });

    this.projectApi
      .loadProject(projectId)
      .subscribe(({ project, sections, tasks }) => {
        this.state.set({
          project,
          sections: toRecord(sections),
          tasks: toRecord(tasks),
        });
      });
  }
}
