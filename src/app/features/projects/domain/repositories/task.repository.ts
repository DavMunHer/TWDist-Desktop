import { Observable } from 'rxjs';
import { Task } from '../entities/task.entity';

export abstract class TaskRepository {
  abstract create(task: Task): Observable<Task>;
  abstract update(task: Task): Observable<Task>;
  abstract delete(taskId: string): Observable<void>;
  abstract findById(taskId: string): Observable<Task>;
}
