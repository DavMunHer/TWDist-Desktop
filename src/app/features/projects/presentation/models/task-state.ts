import { Task } from '../../domain/entities/task.entity';

/**
 * Normalized state for all tasks, keyed by ID.
 *
 * Subtask relationships are expressed via `Task.subtaskIds` and `Task.parentTaskId`.
 * Every subtask also lives as a top-level entry in the dictionary so lookups are O(1).
 */
export interface TaskState {
  tasks: Record<string, Task>;
  loading: boolean;
  error: string | null;
}

export const initialTaskState: TaskState = {
  tasks: {},
  loading: false,
  error: null,
};
