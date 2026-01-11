import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Task } from '../../domain/entities/task.entity';
import { TaskRepository } from '../../domain/repositories/task.repository';

@Injectable()
export class ToggleTaskCompletionUseCase {
  constructor(private taskRepository: TaskRepository) {}

  execute(taskId: string): Observable<Task> {
    return this.taskRepository.findById(taskId).pipe(
      map(task => task.completed ? task.uncomplete() : task.complete()),
      map(updatedTask => {
        this.taskRepository.update(updatedTask).subscribe();
        return updatedTask;
      })
    );
  }
}
