import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Task } from '../../domain/entities/task.entity';
import { TaskRepository } from '../../domain/repositories/task.repository';

@Injectable()
export class CreateTaskUseCase {
  constructor(private taskRepository: TaskRepository) {}

  execute(sectionId: string, taskName: string, startDate: Date = new Date()): Observable<Task> {
    const task = Task.create(taskName, sectionId, startDate);
    return this.taskRepository.create(task);
  }
}
