import { Provider } from '@angular/core';
import { ProjectRepository } from '@features/projects/domain/repositories/project.repository';
import { SectionRepository } from '@features/projects/domain/repositories/section.repository';
import { TaskRepository } from '@features/projects/domain/repositories/task.repository';
import { HttpProjectRepository } from '@features/projects/infrastructure/repositories/http-project.repository';
import { HttpSectionRepository } from '@features/projects/infrastructure/repositories/http-section.repository';
import { HttpTaskRepository } from '@features/projects/infrastructure/repositories/http-task.repository';
import { LoadProjectUseCase } from '@features/projects/application/use-cases/projects/load-project/load-project.use-case';
import { LoadAllProjectsUseCase } from '@features/projects/application/use-cases/projects/load-all-projects/load-all-projects.use-case';
import { CreateProjectUseCase } from '@features/projects/application/use-cases/projects/create-project/create-project.use-case';
import { UpdateProjectUseCase } from '@features/projects/application/use-cases/projects/update-project/update-project.use-case';
import { DeleteProjectUseCase } from '@features/projects/application/use-cases/projects/delete-project/delete-project.use-case';
import { ToggleFavoriteUseCase } from '@features/projects/application/use-cases/projects/toggle-favorite/toggle-favorite.use-case';
import { CreateSectionUseCase } from '@features/projects/application/use-cases/sections/create-section/create-section.use-case';
import { UpdateSectionUseCase } from '@features/projects/application/use-cases/sections/update-section/update-section.use-case';
import { DeleteSectionUseCase } from '@features/projects/application/use-cases/sections/delete-section/delete-section.use-case';
import { CreateTaskUseCase } from '@features/projects/application/use-cases/tasks/create-task/create-task.use-case';
import { ToggleTaskCompletionUseCase } from '@features/projects/application/use-cases/tasks/toggle-task-completion/toggle-task-completion.use-case';
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
  UpdateProjectUseCase,
  DeleteProjectUseCase,
  CreateSectionUseCase,
  UpdateSectionUseCase,
  DeleteSectionUseCase,
  CreateTaskUseCase,
  ToggleTaskCompletionUseCase,
  ToggleFavoriteUseCase,

  // Presentation — Stores
  ProjectStore,
  ProjectSummaryStore,
  SectionStore,
  TaskStore,
];
