import { Provider } from '@angular/core';
import { LoadUpcomingTasksUseCase } from '@features/upcoming/application/use-cases/load-upcoming-tasks/load-upcoming-tasks.use-case';
import { UpcomingTaskRepository } from '@features/upcoming/domain/repositories/upcoming-task.repository';
import { HttpUpcomingTaskRepository } from '@features/upcoming/infrastructure/repositories/http-upcoming-task.repository';

export const UPCOMING_FEATURE_PROVIDERS: Provider[] = [
  { provide: UpcomingTaskRepository, useClass: HttpUpcomingTaskRepository },
  LoadUpcomingTasksUseCase,
];
