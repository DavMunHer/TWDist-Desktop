import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Task, TaskRepository } from '../../domain';

@Injectable()
export class CreateTaskUseCase {
  constructor(private taskRepository: TaskRepository) {}

  execute(sectionId: string, taskName: string, startDate: Date = new Date()): Observable<Task> {
    const task = Task.create(taskName, sectionId, startDate);
    return this.taskRepository.create(task);
  }
}
