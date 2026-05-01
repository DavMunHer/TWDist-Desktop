import { Observable } from 'rxjs';
import { TodayTaskAggregate } from '@features/today/domain/models/today-task.aggregate';

export abstract class TodayTaskRepository {
  abstract findTodayTasks(): Observable<TodayTaskAggregate[]>;
}

