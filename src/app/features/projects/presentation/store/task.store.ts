import { computed, inject, Injectable, signal } from '@angular/core';
import { CreateTaskUseCase } from '@features/projects/application/use-cases/tasks/create-task/create-task.use-case';
import { CompleteTaskUseCase } from '@features/projects/application/use-cases/tasks/complete-task/complete-task.use-case';
import { UncompleteTaskUseCase } from '@features/projects/application/use-cases/tasks/uncomplete-task/uncomplete-task.use-case';
import { UpdateTaskUseCase } from '@features/projects/application/use-cases/tasks/update-task/update-task.use-case';
import { DeleteTaskUseCase } from '@features/projects/application/use-cases/tasks/delete-task/delete-task.use-case';
import { initialTaskState, TaskState } from '@features/projects/presentation/models/task-state';
import { Task } from '@features/projects/domain/entities/task.entity';
import { toProjectsUiError } from '@features/projects/presentation/mappers/projects-ui-error.mapper';
import { ProjectsError } from '@features/projects/application/errors/projects.error';
import { UiError } from '@features/projects/presentation/models/ui-error';

/** Deep-cloned tasks + optional parent captured before optimistic delete (`removeTask`). */
export interface OptimisticDeleteSnapshot {
  readonly subtreeReplicas: readonly Task[];
  readonly parentReplica: Task | null;
}

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
  private readonly completeTaskUseCase = inject(CompleteTaskUseCase);
  private readonly uncompleteTaskUseCase = inject(UncompleteTaskUseCase);
  private readonly updateTaskUseCase = inject(UpdateTaskUseCase);
  private readonly deleteTaskUseCase = inject(DeleteTaskUseCase);

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

  /** Last rich error details */
  readonly errorDetails = computed(() => this.state().errorDetails);

  private setError(message: string, details: UiError | null, context: string, raw: unknown): void {
    this.state.update(s => ({ ...s, error: message, errorDetails: details }));
    console.error(`Failed to ${context}:`, raw);
  }

  private setResultError(error: ProjectsError, context: string): void {
    const uiError = toProjectsUiError(error);
    this.setError(uiError.message, uiError, context, error);
  }

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

  /**
   * Apply a persisted task snapshot from flows that do not run through TaskStore mutations
   * (for example Today view). Keeps parent/subtask links when this task already exists so
   * flat API responses cannot wipe nested structure after the user revisits Project view.
   */
  mergeExternalTask(task: Task): void {
    const existing = this.state().tasks[task.id];
    if (!existing) {
      this.mergeTasks([task]);
      return;
    }

    const subtaskIds = existing.subtaskIds.length > 0 ? existing.subtaskIds : task.subtaskIds;
    const merged = new Task(
      task.id,
      task.sectionId,
      task.name,
      task.completed,
      task.startDate,
      task.description,
      task.label ?? existing.label,
      task.endDate,
      task.completedDate,
      existing.parentTaskId ?? task.parentTaskId,
      subtaskIds,
    );
    this.mergeTasks([merged]);
  }

  /**
   * Captures clones of the task subtree (+ parent row) immediately before optimistic delete so
   * {@link rollbackOptimisticDelete} can rebuild `parent.subtaskIds` and descendants on failure.
   */
  snapshotForOptimisticDelete(taskId: string): OptimisticDeleteSnapshot | null {
    const tasksDict = this.state().tasks;
    const root = tasksDict[taskId];
    if (!root) return null;

    const ids = this.collectTaskAndDescendants(taskId, tasksDict);
    const subtreeReplicas = ids.map(id => TaskStore.replicateTask(tasksDict[id]));

    let parentReplica: Task | null = null;
    if (root.parentTaskId) {
      const p = tasksDict[root.parentTaskId];
      if (p) parentReplica = TaskStore.replicateTask(p);
    }

    return { subtreeReplicas, parentReplica };
  }

  /** Restores dictionary rows after a failed optimistic delete. */
  rollbackOptimisticDelete(snapshot: OptimisticDeleteSnapshot): void {
    this.mergeTasks([...snapshot.subtreeReplicas]);
    if (snapshot.parentReplica !== null) {
      this.mergeTasks([snapshot.parentReplica]);
    }
  }

  /**
   * Reverts {@link mergeExternalTask} when the persistence call fails — pass the snapshot from
   * {@link getTask} **before** the optimistic merge; `undefined` means the row was absent and
   * should be dropped again after an optimistic upsert.
   */
  rollbackExternalTaskMerge(taskId: string, prior: Task | undefined): void {
    if (prior !== undefined) {
      this.mergeTasks([prior]);
    } else {
      this.removeTask(taskId);
    }
  }

  private static replicateTask(task: Task): Task {
    return new Task(
      task.id,
      task.sectionId,
      task.name,
      task.completed,
      task.startDate,
      task.description,
      task.label,
      task.endDate,
      task.completedDate,
      task.parentTaskId,
      [...task.subtaskIds],
    );
  }

  // ===================================================================
  // ACTIONS — single task mutations
  // ===================================================================

  /** Create a task inside a section. Returns a callback with the created task's info for the SectionStore. */
  createTask(
    projectId: string,
    sectionId: string,
    taskName: string,
    onCreated?: (task: Task) => void,
  ): void {
    this.createTaskUseCase.execute(projectId, sectionId, taskName).subscribe({
      next: (result) => {
        if (!result.success) {
          this.setResultError(result.error, 'create task');
          return;
        }

        const task = result.value;
        this.state.update(s => ({
          ...s,
          tasks: { ...s.tasks, [task.id]: task },
        }));
        onCreated?.(task);
      },
    });
  }

  /** Create a subtask under a parent task */
  createSubtask(
    parentTaskId: string,
    projectId: string,
    sectionId: string,
    taskName: string,
  ): void {
    const parentTask = this.state().tasks[parentTaskId];
    if (!parentTask) {
      console.error('Cannot create subtask: parent task not found');
      return;
    }

    this.createTaskUseCase.execute(projectId, sectionId, taskName).subscribe({
      next: (result) => {
        if (!result.success) {
          this.setResultError(result.error, 'create subtask');
          return;
        }

        const subtask = result.value;
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
    });
  }

  /** Remove a task entirely from the store */
  removeTask(taskId: string): void {
    this.state.update(s => {
      const task = s.tasks[taskId];
      if (!task) return s;

      const idsToRemove = this.collectTaskAndDescendants(taskId, s.tasks);
      const idsSet = new Set(idsToRemove);
      const updatedTasks = Object.fromEntries(
        Object.entries(s.tasks).filter(([id]) => !idsSet.has(id)),
      ) as Record<string, Task>;

      if (task.parentTaskId && updatedTasks[task.parentTaskId]) {
        updatedTasks[task.parentTaskId] = updatedTasks[task.parentTaskId].removeSubtask(taskId);
      }

      return {
        ...s,
        tasks: updatedTasks,
      };
    });
  }

  /** Update a task's name in backend and local state */
  updateTaskName(projectId: string, taskId: string, newName: string): void {
    const existing = this.state().tasks[taskId];
    if (!existing) return;

    this.editTask(
      projectId,
      taskId,
      newName,
      existing.description,
      existing.startDate,
      existing.endDate,
      false,
    );
  }

  /** Update a task's editable fields in backend and local state */
  editTask(
    projectId: string,
    taskId: string,
    name: string,
    description?: string,
    startDate?: Date,
    endDate?: Date,
    completionChanged?: boolean,
  ): void {
    const existing = this.state().tasks[taskId];
    if (!existing) return;

    const updatedName = name.trim();
    const normalizedDescription = description?.trim() ? description.trim() : undefined;
    let nextTask = existing
      .updateName(updatedName)
      .updateDescription(normalizedDescription ?? '')
      .setStartDate(startDate)
      .setEndDate(endDate);

    if (completionChanged) {
      nextTask = existing.completed ? nextTask.uncomplete() : nextTask.complete();
    }

    const hasChanges = nextTask.name !== existing.name
      || nextTask.description !== existing.description
      || nextTask.startDate?.getTime() !== existing.startDate?.getTime()
      || nextTask.endDate?.getTime() !== existing.endDate?.getTime()
      || nextTask.completed !== existing.completed;
    if (!hasChanges) return;

    this.state.update(s => ({
      ...s,
      tasks: { ...s.tasks, [taskId]: nextTask },
    }));

    this.updateTaskUseCase.execute(projectId, nextTask).subscribe({
      next: (result) => {
        if (!result.success) {
          this.state.update(s => ({
            ...s,
            tasks: { ...s.tasks, [taskId]: existing },
          }));
          this.setResultError(result.error, 'update task');
          return;
        }

        const updatedTask = result.value;
        this.state.update(s => ({
          ...s,
          tasks: {
            ...s.tasks,
            [taskId]: updatedTask,
          },
        }));
      },
    });
  }

  /** Delete a task in backend and remove it (and descendants) from local state */
  deleteTask(projectId: string, sectionId: string, taskId: string, onDeleted?: () => void): void {
    this.deleteTaskUseCase.execute(projectId, sectionId, taskId).subscribe({
      next: () => {
        this.removeTask(taskId);
        onDeleted?.();
      },
      error: (error) => {
        this.setError(error.message, null, 'delete task', error);
      },
    });
  }

  /** Toggle a task's completed status in backend and local state */
  toggleTaskCompletion(projectId: string, taskId: string): void {
    const existing = this.state().tasks[taskId];
    if (!existing) return;

    const optimisticTask = existing.completed ? existing.uncomplete() : existing.complete();
    this.state.update(s => ({
      ...s,
      tasks: { ...s.tasks, [taskId]: optimisticTask },
    }));

    const request$ = existing.completed
      ? this.uncompleteTaskUseCase.execute(projectId, existing)
      : this.completeTaskUseCase.execute(projectId, existing);
    const context = existing.completed ? 'uncomplete task' : 'complete task';

    request$.subscribe({
      next: (result) => {
        if (!result.success) {
          // Roll back the optimistic update when persistence fails.
          this.state.update(s => ({
            ...s,
            tasks: { ...s.tasks, [taskId]: existing },
          }));
          this.setResultError(result.error, context);
          return;
        }

        const updatedTask = result.value;
        this.state.update(s => ({
          ...s,
          tasks: { ...s.tasks, [updatedTask.id]: updatedTask },
        }));
      },
    });
  }

  private collectTaskAndDescendants(taskId: string, tasks: Record<string, Task>): string[] {
    const task = tasks[taskId];
    if (!task) return [];

    const descendants = task.subtaskIds.flatMap(subtaskId => this.collectTaskAndDescendants(subtaskId, tasks));
    return [taskId, ...descendants];
  }
}
