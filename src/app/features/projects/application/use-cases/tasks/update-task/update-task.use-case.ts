import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Task } from '@features/projects/domain/entities/task.entity';
import { TaskRepository } from '@features/projects/domain/repositories/task.repository';
import { Result, fail, ok } from '@shared/utils/result';
import { ProjectsError } from '@features/projects/application/errors/projects.error';
import { TaskName } from '@features/projects/domain/value-objects/task-name.value-object';

@Injectable()
export class UpdateTaskUseCase {
  private readonly taskRepository = inject(TaskRepository);

  execute(projectId: string, task: Task): Observable<Result<Task, ProjectsError>> {
    const taskNameResult = TaskName.tryCreate(task.name);
    if (!taskNameResult.success) {
      return of(fail(taskNameResult.error));
    }

    const normalizedTask = task.updateName(taskNameResult.value.value);
    return this.taskRepository.update(projectId, normalizedTask).pipe(
      map((updated): Result<Task, ProjectsError> => ok(updated)),
      catchError(() => of(fail<ProjectsError>({ code: 'NETWORK_ERROR' }))),
    );
  }
}
