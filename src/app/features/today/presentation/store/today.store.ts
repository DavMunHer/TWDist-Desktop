import { computed, inject, Injectable, signal } from '@angular/core';
import {
  TaskDeleteEvent,
  TaskEditEvent,
  TaskRenameEvent,
  TaskToggleEvent,
} from '@features/projects/presentation/models/project.view-model';
import { TodayGroupViewModel, TodayTaskViewModel } from '@features/today/presentation/models/today.view-model';
import { TodayTaskAggregate } from '@features/today/domain/models/today-task.aggregate';
import { LoadTodayTasksUseCase } from '@features/today/application/use-cases/load-today-tasks/load-today-tasks.use-case';
import { CompleteTaskUseCase } from '@features/projects/application/use-cases/tasks/complete-task/complete-task.use-case';
import { UncompleteTaskUseCase } from '@features/projects/application/use-cases/tasks/uncomplete-task/uncomplete-task.use-case';
import { UpdateTaskUseCase } from '@features/projects/application/use-cases/tasks/update-task/update-task.use-case';
import { DeleteTaskUseCase } from '@features/projects/application/use-cases/tasks/delete-task/delete-task.use-case';
import { TodayState, initialTodayState } from '@features/today/presentation/models/today.state';
import { TaskStore } from '@features/projects/presentation/store/task.store';

/**
 * Store for the Today view.
 *
 * Reads tasks from the dedicated `/api/tasks/today` endpoint and keeps a
 * local optimistic state for task mutations.
 */
@Injectable({ providedIn: 'root' })
export class TodayStore {
  private readonly loadTodayTasksUseCase = inject(LoadTodayTasksUseCase);
  private readonly completeTaskUseCase = inject(CompleteTaskUseCase);
  private readonly uncompleteTaskUseCase = inject(UncompleteTaskUseCase);
  private readonly updateTaskUseCase = inject(UpdateTaskUseCase);
  private readonly deleteTaskUseCase = inject(DeleteTaskUseCase);
  private readonly taskStore = inject(TaskStore);
  private readonly state = signal<TodayState>(initialTodayState);

  // ===================================================================
  // SELECTORS
  // ===================================================================

  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  readonly todayGroups = computed<TodayGroupViewModel[]>(() => {
    const today = this.todayStart();
    const dayGroups = new Map<number, { label: string; tasks: TodayTaskViewModel[] }>();
    for (const aggregate of this.state().aggregates) {
      const { task } = aggregate;
      if (!task.startDate) continue;
      const startDate = new Date(task.startDate);
      startDate.setHours(0, 0, 0, 0);
      if (startDate > today) continue;
      const groupKey = startDate.getTime();
      const label = this.dayLabelForDate(startDate, today);
      const taskVM: TodayTaskViewModel = {
        id: task.id,
        sectionId: task.sectionId,
        name: task.name,
        completed: task.completed,
        startDate: task.startDate,
        description: task.description,
        endDate: task.endDate,
        subtasks: [],
      };
      const existing = dayGroups.get(groupKey);
      if (existing) {
        existing.tasks.push(taskVM);
      } else {
        dayGroups.set(groupKey, { label, tasks: [taskVM] });
      }
    }

    const realGroups = Array.from(dayGroups.entries())
      .sort(([a], [b]) => a - b)
      .map(([, group]) => ({
        label: group.label,
        tasks: group.tasks,
      }));
    return realGroups;
  });

  loadTodayTasks(): void {
    if (this.state().loading) return;
    this.state.update((s) => ({ ...s, loading: true, error: null }));
    this.loadTodayTasksUseCase.execute().subscribe({
      next: (result) => {
        if (!result.success) {
          this.state.update((s) => ({
            ...s,
            loading: false,
            error: 'Failed to load today tasks.',
          }));
          return;
        }
        this.state.set({
          aggregates: result.value,
          loading: false,
          error: null,
        });
      },
      error: () => {
        this.state.update((s) => ({
          ...s,
          loading: false,
          error: 'Failed to load today tasks.',
        }));
      },
    });
  }

  ensureTodayTasksLoaded(): void {
    if (this.state().loading) return;
    this.loadTodayTasks();
  }

  toggleTaskCompletion(event: TaskToggleEvent): void {
    const aggregate = this.resolveAggregate(event.id);
    if (!aggregate) return;
    const previousState = this.state();
    const priorInTaskStore = this.taskStore.getTask(event.id);
    const toggledTask = aggregate.task.completed ? aggregate.task.uncomplete() : aggregate.task.complete();
    this.replaceAggregateTask(event.id, toggledTask);
    this.taskStore.mergeExternalTask(toggledTask);

    const request$ = aggregate.task.completed
      ? this.uncompleteTaskUseCase.execute(aggregate.projectId, aggregate.task)
      : this.completeTaskUseCase.execute(aggregate.projectId, aggregate.task);

    request$.subscribe({
      next: (result) => {
        if (!result.success) {
          this.state.set(previousState);
          this.taskStore.rollbackExternalTaskMerge(event.id, priorInTaskStore);
          this.state.update((s) => ({ ...s, error: 'Failed to update task completion.' }));
          return;
        }
        this.replaceAggregateTask(event.id, result.value);
        this.taskStore.mergeExternalTask(result.value);
      },
      error: () => {
        this.state.set(previousState);
        this.taskStore.rollbackExternalTaskMerge(event.id, priorInTaskStore);
        this.state.update((s) => ({ ...s, error: 'Failed to update task completion.' }));
      },
    });
  }

  renameTask(event: TaskRenameEvent): void {
    const aggregate = this.resolveAggregate(event.id);
    if (!aggregate) return;
    const previousState = this.state();
    const priorInTaskStore = this.taskStore.getTask(event.id);
    const renamedTask = aggregate.task.updateName(event.name.trim());
    this.replaceAggregateTask(event.id, renamedTask);
    this.taskStore.mergeExternalTask(renamedTask);

    this.updateTaskUseCase.execute(aggregate.projectId, renamedTask).subscribe({
      next: (result) => {
        if (!result.success) {
          this.state.set(previousState);
          this.taskStore.rollbackExternalTaskMerge(event.id, priorInTaskStore);
          this.state.update((s) => ({ ...s, error: 'Failed to rename task.' }));
          return;
        }
        this.replaceAggregateTask(event.id, result.value);
        this.taskStore.mergeExternalTask(result.value);
      },
      error: () => {
        this.state.set(previousState);
        this.taskStore.rollbackExternalTaskMerge(event.id, priorInTaskStore);
        this.state.update((s) => ({ ...s, error: 'Failed to rename task.' }));
      },
    });
  }

  deleteTask(event: TaskDeleteEvent): void {
    const aggregate = this.resolveAggregate(event.id);
    if (!aggregate) return;
    const previousState = this.state();
    const optimisticDeleteSnapshot = this.taskStore.snapshotForOptimisticDelete(event.id);

    this.state.update((s) => ({
      ...s,
      aggregates: s.aggregates.filter((a) => a.task.id !== event.id),
    }));

    if (optimisticDeleteSnapshot !== null) {
      this.taskStore.removeTask(event.id);
    }

    this.deleteTaskUseCase.execute(aggregate.projectId, event.sectionId, event.id).subscribe({
      next: () => {
        /* Optimistic remove already cleared TaskStore rows. */
      },
      error: () => {
        this.state.set(previousState);
        if (optimisticDeleteSnapshot !== null) {
          this.taskStore.rollbackOptimisticDelete(optimisticDeleteSnapshot);
        }
        this.state.update((s) => ({ ...s, error: 'Failed to delete task.' }));
      },
    });
  }

  editTask(event: TaskEditEvent): void {
    const aggregate = this.resolveAggregate(event.id);
    if (!aggregate) return;

    const previousState = this.state();
    const priorInTaskStore = this.taskStore.getTask(event.id);
    const normalizedDescription = event.description?.trim() ? event.description.trim() : undefined;
    const baseUpdatedTask = aggregate.task
      .updateName(event.name.trim())
      .updateDescription(normalizedDescription ?? '')
      .setStartDate(event.startDate)
      .setEndDate(event.endDate);
    const nextTask = event.completedChanged
      ? (aggregate.task.completed ? baseUpdatedTask.uncomplete() : baseUpdatedTask.complete())
      : baseUpdatedTask;

    this.replaceAggregateTask(event.id, nextTask);
    this.taskStore.mergeExternalTask(nextTask);

    this.updateTaskUseCase.execute(aggregate.projectId, nextTask).subscribe({
      next: (updateResult) => {
        if (!updateResult.success) {
          this.state.set(previousState);
          this.taskStore.rollbackExternalTaskMerge(event.id, priorInTaskStore);
          this.state.update((s) => ({ ...s, error: 'Failed to edit task.' }));
          return;
        }

        this.replaceAggregateTask(event.id, updateResult.value);
        this.taskStore.mergeExternalTask(updateResult.value);
      },
      error: () => {
        this.state.set(previousState);
        this.taskStore.rollbackExternalTaskMerge(event.id, priorInTaskStore);
        this.state.update((s) => ({ ...s, error: 'Failed to edit task.' }));
      },
    });
  }

  private dayLabelForDate(date: Date, today: Date): string {
    if (date.getTime() === today.getTime()) return 'Today';
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }

  private todayStart(): Date {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private resolveAggregate(taskId: string): TodayTaskAggregate | undefined {
    return this.state().aggregates.find((aggregate) => aggregate.task.id === taskId);
  }

  private replaceAggregateTask(taskId: string, nextTask: TodayTaskAggregate['task']): void {
    this.state.update((s) => ({
      ...s,
      aggregates: s.aggregates.map((aggregate) =>
        aggregate.task.id === taskId
          ? { ...aggregate, task: nextTask }
          : aggregate
      ),
    }));
  }
}
