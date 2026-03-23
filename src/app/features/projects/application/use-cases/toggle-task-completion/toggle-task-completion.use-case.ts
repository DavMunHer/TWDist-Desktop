import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { Task } from '@features/projects/domain/entities/task.entity';

@Injectable()
export class ToggleTaskCompletionUseCase {
  // FIXME: Persist completion toggle in the backend.
  // The current backend routes only support updating a task's name, so completion toggling is
  // handled locally in the UI for now.
  execute(task: Task): Observable<Task> {
    const updated = task.completed ? task.uncomplete() : task.complete();
    return of(updated);
  }
}
