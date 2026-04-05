import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Task } from '@features/projects/domain/entities/task.entity';
import { TaskRepository } from '@features/projects/domain/repositories/task.repository';

@Injectable()
export class UpdateTaskUseCase {
  private readonly taskRepository = inject(TaskRepository);

  execute(projectId: string, task: Task): Observable<Task> {
    return this.taskRepository.update(projectId, task);
  }
}
