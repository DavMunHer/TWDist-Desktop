import { computed, inject, Injectable, signal } from '@angular/core';
import { LoadProjectUseCase } from '../../application/use-cases/load-project.use-case';
import { Project } from '../../domain/entities/project.entity';
import { Section } from '../../domain/entities/section.entity';
import { Task } from '../../domain/entities/task.entity';
import { ProjectViewModel } from '../models/project.view-model';
import { ProjectState } from '../models/project-state';
import { ProjectDto } from '../../infrastructure/dto/project.dto';
import { CreateProjectUseCase } from '../../application/use-cases/create-project.use-case';

@Injectable({ providedIn: 'root' })
export class ProjectStore {
  private loadProjectUseCase = inject(LoadProjectUseCase);
  private createProjectUseCase = inject(CreateProjectUseCase);

  private readonly state = signal<ProjectState>({
    projects: [],
  });

  readonly projects = computed(() => this.state().projects);

  createProject(projectDto: ProjectDto): void {
    this.state.set({
      projects: [],
    });

    this.createProjectUseCase.execute(projectDto).subscribe({
      next: (project) => {
        this.state.set({
          projects: [project],
        });
      },
      error: (error) => {
        console.error('Failed to create project:', error);
      },
    });
  }

  loadProject(projectId: string): void {
    this.state.set({
      projects: [],
    });

    this.loadProjectUseCase.execute(projectId).subscribe({
      next: (project) => {
        this.state.set({
          projects: [project],
        });
      },
      error: (error) => {
        console.error('Failed to load project:', error);
      },
    });
  }

}
