import { Provider } from '@angular/core';
import { TodayTaskRepository } from '@features/today/domain/repositories/today-task.repository';
import { HttpTodayTaskRepository } from '@features/today/infrastructure/repositories/http-today-task.repository';
import { LoadTodayTasksUseCase } from '@features/today/application/use-cases/load-today-tasks/load-today-tasks.use-case';

export const TODAY_FEATURE_PROVIDERS: Provider[] = [
  { provide: TodayTaskRepository, useClass: HttpTodayTaskRepository },
  LoadTodayTasksUseCase,
];

