import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Task } from '@features/projects/domain/entities/task.entity';
import { TaskRepository } from '@features/projects/domain/repositories/task.repository';
import { Result, fail, ok } from '@shared/utils/result';
import { ProjectsError } from '@features/projects/application/errors/projects.error';
import { TaskName } from '@features/projects/domain/value-objects/task-name.value-object';

@Injectable()
export class CreateTaskUseCase {
  private readonly taskRepository = inject(TaskRepository);


  execute(
    projectId: string,
    sectionId: string,
    taskName: string,
    startDate: Date = new Date(),
  ): Observable<Result<Task, ProjectsError>> {
    const taskNameResult = TaskName.tryCreate(taskName);
    if (!taskNameResult.success) {
      return of(fail(taskNameResult.error));
    }

    const task = Task.create(taskNameResult.value.value, sectionId, startDate);
    return this.taskRepository.create(projectId, task).pipe(
      map((created): Result<Task, ProjectsError> => ok(created)),
      catchError(() => of(fail<ProjectsError>({ code: 'NETWORK_ERROR' }))),
    );
  }
}
