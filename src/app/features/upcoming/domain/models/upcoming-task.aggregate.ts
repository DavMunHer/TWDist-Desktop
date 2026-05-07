import { Task } from '@features/projects/domain/entities/task.entity';

export interface UpcomingTaskAggregate {
  task: Task;
  projectId: string;
  projectName?: string;
}
