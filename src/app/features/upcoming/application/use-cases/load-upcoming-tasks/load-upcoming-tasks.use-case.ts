import { Injectable, inject } from '@angular/core';
import { ProjectsError } from '@features/projects/application/errors/projects.error';
import { UpcomingTaskAggregate } from '@features/upcoming/domain/models/upcoming-task.aggregate';
import { UpcomingTaskRepository } from '@features/upcoming/domain/repositories/upcoming-task.repository';
import { Result, fail, ok } from '@shared/utils/result';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class LoadUpcomingTasksUseCase {
  private readonly upcomingTaskRepository = inject(UpcomingTaskRepository);

  execute(from: Date, to: Date): Observable<Result<UpcomingTaskAggregate[], ProjectsError>> {
    return this.upcomingTaskRepository.findUpcomingTasks(from, to).pipe(
      map((tasks): Result<UpcomingTaskAggregate[], ProjectsError> => ok(tasks)),
      catchError(() => of(fail<ProjectsError>({ code: 'NETWORK_ERROR' }))),
    );
  }
}
