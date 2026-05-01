import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { TodayTaskRepository } from '@features/today/domain/repositories/today-task.repository';
import { TodayTaskAggregate } from '@features/today/domain/models/today-task.aggregate';
import { Result, fail, ok } from '@shared/utils/result';
import { ProjectsError } from '@features/projects/application/errors/projects.error';

@Injectable()
export class LoadTodayTasksUseCase {
  private readonly todayTaskRepository = inject(TodayTaskRepository);

  execute(): Observable<Result<TodayTaskAggregate[], ProjectsError>> {
    return this.todayTaskRepository.findTodayTasks().pipe(
      map((tasks): Result<TodayTaskAggregate[], ProjectsError> => ok(tasks)),
      catchError(() => of(fail<ProjectsError>({ code: 'NETWORK_ERROR' }))),
    );
  }
}

