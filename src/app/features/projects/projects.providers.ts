import { Provider } from '@angular/core';
import { ProjectRepository } from './domain/repositories/project.repository';
import { SectionRepository } from './domain/repositories/section.repository';
import { TaskRepository } from './domain/repositories/task.repository';
import { HttpProjectRepository } from './infrastructure/repositories/http-project.repository';
import { HttpSectionRepository } from './infrastructure/repositories/http-section.repository';
import { HttpTaskRepository } from './infrastructure/repositories/http-task.repository';
import { LoadProjectUseCase } from './application/use-cases/load-project.use-case';
import { LoadAllProjectsUseCase } from './application/use-cases/load-all-projects.use-case';
import { CreateSectionUseCase } from './application/use-cases/create-section.use-case';
import { CreateTaskUseCase } from './application/use-cases/create-task.use-case';
import { ToggleTaskCompletionUseCase } from './application/use-cases/toggle-task-completion.use-case';
import { ToggleFavoriteUseCase } from './application/use-cases/toggle-favorite.use-case';
import { CreateProjectUseCase } from './application/use-cases/create-project.use-case';
import { ProjectStore } from './presentation/store/project.store';
import { SectionStore } from './presentation/store/section.store';
import { TaskStore } from './presentation/store/task.store';

export const PROJECT_FEATURE_PROVIDERS: Provider[] = [
  // Repositories
  { provide: ProjectRepository, useClass: HttpProjectRepository },
  { provide: SectionRepository, useClass: HttpSectionRepository },
  { provide: TaskRepository, useClass: HttpTaskRepository },

  // Use Cases
  LoadProjectUseCase,
  LoadAllProjectsUseCase,
  CreateProjectUseCase,
  CreateSectionUseCase,
  CreateTaskUseCase,
  ToggleTaskCompletionUseCase,
  ToggleFavoriteUseCase,

  // Presentation — Stores
  ProjectStore,
  SectionStore,
  TaskStore,
];
