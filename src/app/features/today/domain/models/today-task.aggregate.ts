import { Task } from '@features/projects/domain/entities/task.entity';

export interface TodayTaskAggregate {
  task: Task;
  projectId: string;
}

