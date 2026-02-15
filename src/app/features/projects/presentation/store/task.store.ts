import { computed, inject, Injectable, signal } from '@angular/core';
import { CreateTaskUseCase } from '../../application/use-cases/create-task.use-case';
import { ToggleTaskCompletionUseCase } from '../../application/use-cases/toggle-task-completion.use-case';
import { initialTaskState, TaskState } from '../models/task-state';
import { Task } from '../../domain/entities/task.entity';

/**
 * Normalized store for **tasks** (and subtasks).
 *
 * Every task — regardless of nesting depth — lives as a flat entry in
 * `state.tasks`, keyed by its ID. Subtask relationships are expressed
 * through `Task.subtaskIds` (children) and `Task.parentTaskId` (parent).
 */
@Injectable({ providedIn: 'root' })
export class TaskStore {
  private readonly createTaskUseCase = inject(CreateTaskUseCase);
  private readonly toggleTaskUseCase = inject(ToggleTaskCompletionUseCase);

  private readonly state = signal<TaskState>(initialTaskState);

  // ===================================================================
  // SELECTORS
  // ===================================================================

  /** Full tasks dictionary (for cross-store reads) */
  readonly tasks = computed(() => this.state().tasks);

  /** Loading flag */
  readonly loading = computed(() => this.state().loading);

  /** Last error */
  readonly error = computed(() => this.state().error);

  /** Get a single task by ID */
  getTask(taskId: string): Task | undefined {
    return this.state().tasks[taskId];
  }

  /** Get root-level tasks for a given set of task IDs (no parent) */
  rootTasksForIds(taskIds: readonly string[]): Task[] {
    const tasks = this.state().tasks;
    return taskIds
      .map(id => tasks[id])
      .filter((t): t is Task => !!t && !t.parentTaskId);
  }

  // ===================================================================
  // ACTIONS — bulk merge (used by ProjectStore during load)
  // ===================================================================

  /** Merge an array of tasks into the dictionary */
  mergeTasks(tasks: Task[]): void {
    this.state.update(s => {
      const merged = { ...s.tasks };
      for (const task of tasks) {
        merged[task.id] = task;
      }
      return { ...s, tasks: merged };
    });
  }

  // ===================================================================
  // ACTIONS — single task mutations
  // ===================================================================

  /** Create a task inside a section. Returns a callback with the created task's info for the SectionStore. */
  createTask(
    sectionId: string,
    taskName: string,
    onCreated?: (task: Task) => void,
  ): void {
    this.createTaskUseCase.execute(sectionId, taskName).subscribe({
      next: (task) => {
        this.state.update(s => ({
          ...s,
          tasks: { ...s.tasks, [task.id]: task },
        }));
        onCreated?.(task);
      },
      error: (error) => {
        this.state.update(s => ({ ...s, error: error.message }));
        console.error('Failed to create task:', error);
      },
    });
  }

  /** Create a subtask under a parent task */
  createSubtask(
    parentTaskId: string,
    sectionId: string,
    taskName: string,
  ): void {
    const parentTask = this.state().tasks[parentTaskId];
    if (!parentTask) {
      console.error('Cannot create subtask: parent task not found');
      return;
    }

    this.createTaskUseCase.execute(sectionId, taskName).subscribe({
      next: (subtask) => {
        // Override the subtask with the correct parentTaskId
        const subtaskWithParent = new Task(
          subtask.id,
          subtask.sectionId,
          subtask.name,
          subtask.completed,
          subtask.startDate,
          subtask.description,
          subtask.label,
          subtask.endDate,
          subtask.completedDate,
          parentTaskId,
        );

        this.state.update(s => ({
          ...s,
          tasks: {
            ...s.tasks,
            [subtaskWithParent.id]: subtaskWithParent,
            [parentTaskId]: (s.tasks[parentTaskId]).addSubtask(subtaskWithParent.id),
          },
        }));
      },
      error: (error) => {
        this.state.update(s => ({ ...s, error: error.message }));
        console.error('Failed to create subtask:', error);
      },
    });
  }

  /** Toggle a task's completed status */
  toggleTaskCompletion(taskId: string): void {
    this.toggleTaskUseCase.execute(taskId).subscribe({
      next: (updatedTask) => {
        this.state.update(s => ({
          ...s,
          tasks: { ...s.tasks, [updatedTask.id]: updatedTask },
        }));
      },
      error: (error) => {
        this.state.update(s => ({ ...s, error: error.message }));
        console.error('Failed to toggle task:', error);
      },
    });
  }
}
