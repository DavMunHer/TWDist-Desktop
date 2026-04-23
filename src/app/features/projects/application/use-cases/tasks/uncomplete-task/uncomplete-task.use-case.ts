import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Task } from '@features/projects/domain/entities/task.entity';
import { TaskRepository } from '@features/projects/domain/repositories/task.repository';
import { ProjectsError } from '@features/projects/application/errors/projects.error';
import { Result, fail, ok } from '@shared/utils/result';

@Injectable()
export class UncompleteTaskUseCase {
  private readonly taskRepository = inject(TaskRepository);

  execute(projectId: string, task: Task): Observable<Result<Task, ProjectsError>> {
    return this.taskRepository.uncomplete(projectId, task.sectionId, task.id).pipe(
      map((updated): Result<Task, ProjectsError> => ok(updated)),
      catchError(() => of(fail<ProjectsError>({ code: 'NETWORK_ERROR' }))),
    );
  }
}
