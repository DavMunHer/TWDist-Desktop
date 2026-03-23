import { Provider } from '@angular/core';
import { ProjectRepository } from '@features/projects/domain/repositories/project.repository';
import { SectionRepository } from '@features/projects/domain/repositories/section.repository';
import { TaskRepository } from '@features/projects/domain/repositories/task.repository';
import { HttpProjectRepository } from '@features/projects/infrastructure/repositories/http-project.repository';
import { HttpSectionRepository } from '@features/projects/infrastructure/repositories/http-section.repository';
import { HttpTaskRepository } from '@features/projects/infrastructure/repositories/http-task.repository';
import { LoadProjectUseCase } from '@features/projects/application/use-cases/load-project/load-project.use-case';
import { LoadAllProjectsUseCase } from '@features/projects/application/use-cases/load-all-projects/load-all-projects.use-case';
import { CreateSectionUseCase } from '@features/projects/application/use-cases/create-section/create-section.use-case';
import { CreateTaskUseCase } from '@features/projects/application/use-cases/create-task/create-task.use-case';
import { ToggleTaskCompletionUseCase } from '@features/projects/application/use-cases/toggle-task-completion/toggle-task-completion.use-case';
import { ToggleFavoriteUseCase } from '@features/projects/application/use-cases/toggle-favorite/toggle-favorite.use-case';
import { CreateProjectUseCase } from '@features/projects/application/use-cases/create-project/create-project.use-case';
import { DeleteProjectUseCase } from '@features/projects/application/use-cases/delete-project/delete-project.use-case';
import { ProjectStore } from '@features/projects/presentation/store/project.store';
import { ProjectSummaryStore } from '@features/projects/presentation/store/project-summary.store';
import { SectionStore } from '@features/projects/presentation/store/section.store';
import { TaskStore } from '@features/projects/presentation/store/task.store';

export const PROJECT_FEATURE_PROVIDERS: Provider[] = [
  // Repositories
  { provide: ProjectRepository, useClass: HttpProjectRepository },
  { provide: SectionRepository, useClass: HttpSectionRepository },
  { provide: TaskRepository, useClass: HttpTaskRepository },

  // Use Cases
  LoadProjectUseCase,
  LoadAllProjectsUseCase,
  CreateProjectUseCase,
  DeleteProjectUseCase,
  CreateSectionUseCase,
  CreateTaskUseCase,
  ToggleTaskCompletionUseCase,
  ToggleFavoriteUseCase,

  // Presentation — Stores
  ProjectStore,
  ProjectSummaryStore,
  SectionStore,
  TaskStore,
];
