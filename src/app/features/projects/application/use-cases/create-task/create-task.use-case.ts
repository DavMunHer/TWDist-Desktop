import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Task } from '@features/projects/domain/entities/task.entity';
import { TaskRepository } from '@features/projects/domain/repositories/task.repository';

@Injectable()
export class CreateTaskUseCase {
  private taskRepository = inject(TaskRepository);


  execute(projectId: string, sectionId: string, taskName: string, startDate: Date = new Date()): Observable<Task> {
    const task = Task.create(taskName, sectionId, startDate);
    return this.taskRepository.create(projectId, task);
  }
}
