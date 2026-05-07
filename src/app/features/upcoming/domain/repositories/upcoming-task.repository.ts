import { UpcomingTaskAggregate } from '@features/upcoming/domain/models/upcoming-task.aggregate';
import { Observable } from 'rxjs';

export abstract class UpcomingTaskRepository {
  abstract findUpcomingTasks(from: Date, to: Date): Observable<UpcomingTaskAggregate[]>;
}
