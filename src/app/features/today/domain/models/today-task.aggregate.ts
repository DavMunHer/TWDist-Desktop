import { Task } from '@features/projects/domain/entities/task.entity';

export interface TodayTaskAggregate {
  task: Task;
  projectId: string;
  /**
   * Optional display metadata preserved from today endpoint.
   * Kept in aggregate so UI can render project context without
   * introducing a breaking contract change later.
   */
  projectName?: string;
}

