import { Observable } from 'rxjs';
import { Task } from '@features/projects/domain/entities/task.entity';

export abstract class TaskRepository {
  /**
   * For `create` and `update` we do NOT accept `sectionId` as a separate parameter because it is
   * already part of the `Task` (`task.sectionId`). Passing it here would duplicate data and make
   * the call-site more awkward. (The backend still needs it, but we take it from the `Task`.)
   */
  abstract create(projectId: string, task: Task): Observable<Task>;
  abstract update(projectId: string, task: Task): Observable<Task>;
  abstract complete(projectId: string, sectionId: string, taskId: string, completedDate: string): Observable<Task>;
  abstract uncomplete(projectId: string, sectionId: string, taskId: string): Observable<Task>;

  /**
   * For `delete` and `findById` we DO accept `sectionId` because at that point we do NOT have a
   * `Task` instance yet, only IDs. We need it to build the backend URL.
   */
  abstract delete(projectId: string, sectionId: string, taskId: string): Observable<void>;
  abstract findById(projectId: string, sectionId: string, taskId: string): Observable<Task>;
}
