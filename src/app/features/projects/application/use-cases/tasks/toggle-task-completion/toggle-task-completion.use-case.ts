import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Task } from '@features/projects/domain/entities/task.entity';
import { ProjectsError } from '@features/projects/application/errors/projects.error';
import { Result } from '@shared/utils/result';
import { CompleteTaskUseCase } from '@features/projects/application/use-cases/tasks/complete-task/complete-task.use-case';
import { UncompleteTaskUseCase } from '@features/projects/application/use-cases/tasks/uncomplete-task/uncomplete-task.use-case';

@Injectable()
export class ToggleTaskCompletionUseCase {
  private readonly completeTaskUseCase = inject(CompleteTaskUseCase);
  private readonly uncompleteTaskUseCase = inject(UncompleteTaskUseCase);

  execute(projectId: string, task: Task): Observable<Result<Task, ProjectsError>> {
    if (task.completed) {
      return this.uncompleteTaskUseCase.execute(projectId, task);
    }

    return this.completeTaskUseCase.execute(projectId, task);
  }
}
