import { Task } from '@features/projects/domain/entities/task.entity';
import { UiError } from '@features/projects/presentation/models/ui-error';

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
  errorDetails: UiError | null;
}

export const initialTaskState: TaskState = {
  tasks: {},
  loading: false,
  error: null,
  errorDetails: null,
};
