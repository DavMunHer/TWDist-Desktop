import { Provider } from '@angular/core';
import { 
  ProjectRepository, 
  SectionRepository, 
  TaskRepository 
} from './domain';
import { 
  HttpProjectRepository,
  HttpSectionRepository,
  HttpTaskRepository
} from './infrastructure';
import {
  LoadProjectUseCase,
  CreateSectionUseCase,
  CreateTaskUseCase,
  ToggleTaskCompletionUseCase
} from './application';
import { ProjectStore } from './presentation';

export const PROJECT_FEATURE_PROVIDERS: Provider[] = [
  // Repositories
  { provide: ProjectRepository, useClass: HttpProjectRepository },
  { provide: SectionRepository, useClass: HttpSectionRepository },
  { provide: TaskRepository, useClass: HttpTaskRepository },
  
  // Use Cases
  LoadProjectUseCase,
  CreateSectionUseCase,
  CreateTaskUseCase,
  ToggleTaskCompletionUseCase,
  
  // Presentation
  ProjectStore,
];
