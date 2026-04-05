import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { TaskRepository } from '@features/projects/domain/repositories/task.repository';

@Injectable()
export class DeleteTaskUseCase {
  private readonly taskRepository = inject(TaskRepository);

  execute(projectId: string, sectionId: string, taskId: string): Observable<void> {
    return this.taskRepository.delete(projectId, sectionId, taskId);
  }
}
