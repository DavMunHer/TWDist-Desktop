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
  private readonly state = signal<TodayState>(initialTodayState);

  // ===================================================================
  // SELECTORS
  // ===================================================================

  readonly loading = computed(() => this.state().loading);
  readonly loaded = computed(() => this.state().loaded);
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
            loaded: true,
            error: 'Failed to load today tasks.',
          }));
          return;
        }
        this.state.set({
          aggregates: result.value,
          loading: false,
          loaded: true,
          error: null,
        });
      },
      error: () => {
        this.state.update((s) => ({
          ...s,
          loading: false,
          loaded: true,
          error: 'Failed to load today tasks.',
        }));
      },
    });
  }

  ensureTodayTasksLoaded(): void {
    if (this.state().loaded || this.state().loading) return;
    this.loadTodayTasks();
  }

  toggleTaskCompletion(event: TaskToggleEvent): void {
    const aggregate = this.resolveAggregate(event.id);
    if (!aggregate) return;
    const previousState = this.state();
    const toggledTask = aggregate.task.completed ? aggregate.task.uncomplete() : aggregate.task.complete();
    this.replaceAggregateTask(event.id, toggledTask);

    const request$ = aggregate.task.completed
      ? this.uncompleteTaskUseCase.execute(aggregate.projectId, aggregate.task)
      : this.completeTaskUseCase.execute(aggregate.projectId, aggregate.task);

    request$.subscribe({
      next: (result) => {
        if (!result.success) {
          this.state.set(previousState);
          this.state.update((s) => ({ ...s, error: 'Failed to update task completion.' }));
          return;
        }
        this.replaceAggregateTask(event.id, result.value);
      },
      error: () => {
        this.state.set(previousState);
        this.state.update((s) => ({ ...s, error: 'Failed to update task completion.' }));
      },
    });
  }

  renameTask(event: TaskRenameEvent): void {
    const aggregate = this.resolveAggregate(event.id);
    if (!aggregate) return;
    const previousState = this.state();
    const renamedTask = aggregate.task.updateName(event.name.trim());
    this.replaceAggregateTask(event.id, renamedTask);

    this.updateTaskUseCase.execute(aggregate.projectId, renamedTask).subscribe({
      next: (result) => {
        if (!result.success) {
          this.state.set(previousState);
          this.state.update((s) => ({ ...s, error: 'Failed to rename task.' }));
          return;
        }
        this.replaceAggregateTask(event.id, result.value);
      },
      error: () => {
        this.state.set(previousState);
        this.state.update((s) => ({ ...s, error: 'Failed to rename task.' }));
      },
    });
  }

  deleteTask(event: TaskDeleteEvent): void {
    const aggregate = this.resolveAggregate(event.id);
    if (!aggregate) return;
    const previousState = this.state();
    this.state.update((s) => ({
      ...s,
      aggregates: s.aggregates.filter((a) => a.task.id !== event.id),
    }));

    this.deleteTaskUseCase.execute(aggregate.projectId, event.sectionId, event.id).subscribe({
      error: () => {
        this.state.set(previousState);
        this.state.update((s) => ({ ...s, error: 'Failed to delete task.' }));
      },
    });
  }

  editTask(event: TaskEditEvent): void {
    const aggregate = this.resolveAggregate(event.id);
    if (!aggregate) return;

    const previousState = this.state();
    const normalizedDescription = event.description?.trim() ? event.description.trim() : undefined;
    const baseUpdatedTask = aggregate.task
      .updateName(event.name.trim())
      .updateDescription(normalizedDescription ?? '')
      .setStartDate(event.startDate)
      .setEndDate(event.endDate);
    const optimisticTask = event.completedChanged
      ? (aggregate.task.completed ? baseUpdatedTask.uncomplete() : baseUpdatedTask.complete())
      : baseUpdatedTask;

    this.replaceAggregateTask(event.id, optimisticTask);

    this.updateTaskUseCase.execute(aggregate.projectId, baseUpdatedTask).subscribe({
      next: (updateResult) => {
        if (!updateResult.success) {
          this.state.set(previousState);
          this.state.update((s) => ({ ...s, error: 'Failed to edit task.' }));
          return;
        }

        if (!event.completedChanged) {
          this.replaceAggregateTask(event.id, updateResult.value);
          return;
        }

        const completion$ = aggregate.task.completed
          ? this.uncompleteTaskUseCase.execute(aggregate.projectId, updateResult.value)
          : this.completeTaskUseCase.execute(aggregate.projectId, updateResult.value);

        completion$.subscribe({
          next: (completionResult) => {
            if (!completionResult.success) {
              this.state.set(previousState);
              this.state.update((s) => ({ ...s, error: 'Failed to edit task.' }));
              return;
            }
            this.replaceAggregateTask(event.id, completionResult.value);
          },
          error: () => {
            this.state.set(previousState);
            this.state.update((s) => ({ ...s, error: 'Failed to edit task.' }));
          },
        });
      },
      error: () => {
        this.state.set(previousState);
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
