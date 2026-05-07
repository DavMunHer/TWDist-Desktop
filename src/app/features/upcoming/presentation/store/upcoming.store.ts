import { computed, inject, Injectable, signal } from '@angular/core';
import { CompleteTaskUseCase } from '@features/projects/application/use-cases/tasks/complete-task/complete-task.use-case';
import { DeleteTaskUseCase } from '@features/projects/application/use-cases/tasks/delete-task/delete-task.use-case';
import { UncompleteTaskUseCase } from '@features/projects/application/use-cases/tasks/uncomplete-task/uncomplete-task.use-case';
import { UpdateTaskUseCase } from '@features/projects/application/use-cases/tasks/update-task/update-task.use-case';
import { Task } from '@features/projects/domain/entities/task.entity';
import {
  TaskDeleteEvent,
  TaskEditEvent,
  TaskRenameEvent,
  TaskToggleEvent,
} from '@features/projects/presentation/models/project.view-model';
import { TaskStore } from '@features/projects/presentation/store/task.store';
import { UpcomingTaskAggregate } from '@features/upcoming/domain/models/upcoming-task.aggregate';
import { LoadUpcomingTasksUseCase } from '@features/upcoming/application/use-cases/load-upcoming-tasks/load-upcoming-tasks.use-case';
import {
  UpcomingGroupViewModel,
  UpcomingTaskViewModel,
  WeekRange,
} from '@features/upcoming/presentation/models/upcoming.view-model';
import { initialUpcomingState, UpcomingState } from '@features/upcoming/presentation/models/upcoming.state';

@Injectable()
export class UpcomingStore {
  private readonly loadUpcomingTasksUseCase = inject(LoadUpcomingTasksUseCase);
  private readonly completeTaskUseCase = inject(CompleteTaskUseCase);
  private readonly uncompleteTaskUseCase = inject(UncompleteTaskUseCase);
  private readonly updateTaskUseCase = inject(UpdateTaskUseCase);
  private readonly deleteTaskUseCase = inject(DeleteTaskUseCase);
  private readonly taskStore = inject(TaskStore);

  private readonly today = this.dayStart(new Date());
  private readonly currentWeekMonday = this.startOfWeek(this.today);
  private readonly state = signal<UpcomingState>(
    initialUpcomingState(this.currentWeekMonday),
  );
  private readonly hasLoadedOnce = signal(false);
  private readonly scrollToTodayTick = signal(0);

  readonly isCurrentWeek = computed(
    () => this.state().selectedWeekStart.getTime() === this.currentWeekMonday.getTime(),
  );

  readonly weekRange = computed<WeekRange>(() => {
    const start = this.state().selectedWeekStart;
    const end = this.addDays(start, 6);
    const startLabel = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endLabel = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return {
      start,
      end,
      label: `${startLabel} - ${endLabel}`,
    };
  });

  readonly upcomingGroups = computed<UpcomingGroupViewModel[]>(() => {
    const allDays = this.daysForSelectedWeek();
    const visibleDays = this.isCurrentWeek()
      ? allDays.filter((day) => day.getTime() >= this.today.getTime())
      : allDays;

    return visibleDays.map((day) => {
      const dayTasks = this.state().aggregates
        .filter((aggregate) => {
          if (!aggregate.task.startDate) return false;
          return this.dayStart(aggregate.task.startDate).getTime() === day.getTime();
        })
        .map((aggregate) => this.toTaskViewModel(aggregate.task));

      return {
        label: this.dayLabel(day),
        dateLabel: day.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        isToday: day.getTime() === this.today.getTime(),
        tasks: dayTasks,
      };
    });
  });

  readonly scrollToTodaySignal = computed(() => this.scrollToTodayTick());
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  goToPreviousWeek(): void {
    if (this.isCurrentWeek()) return;
    this.state.update((s) => ({
      ...s,
      selectedWeekStart: this.addDays(s.selectedWeekStart, -7),
    }));
    if (this.hasLoadedOnce()) {
      this.loadUpcomingTasksForWeek(this.state().selectedWeekStart);
    }
  }

  goToNextWeek(): void {
    this.state.update((s) => ({
      ...s,
      selectedWeekStart: this.addDays(s.selectedWeekStart, 7),
    }));
    if (this.hasLoadedOnce()) {
      this.loadUpcomingTasksForWeek(this.state().selectedWeekStart);
    }
  }

  goToCurrentWeek(): void {
    this.state.update((s) => ({
      ...s,
      selectedWeekStart: this.currentWeekMonday,
    }));
    if (this.hasLoadedOnce()) {
      this.loadUpcomingTasksForWeek(this.state().selectedWeekStart);
    }
    this.scrollToTodayTick.update((tick) => tick + 1);
  }

  ensureUpcomingTasksLoaded(): void {
    if (this.hasLoadedOnce()) return;
    this.hasLoadedOnce.set(true);
    this.loadUpcomingTasksForWeek(this.state().selectedWeekStart);
  }

  loadUpcomingTasks(): void {
    this.loadUpcomingTasksForWeek(this.state().selectedWeekStart);
  }

  toggleTaskCompletion(event: TaskToggleEvent): void {
    const aggregate = this.resolveAggregate(event.id);
    if (!aggregate) return;

    const previousState = this.state();
    const priorInTaskStore = this.taskStore.getTask(event.id);

    if (aggregate.task.completed) {
      const uncompletedTask = aggregate.task.uncomplete();
      this.replaceAggregateTask(event.id, uncompletedTask);
      this.taskStore.mergeExternalTask(uncompletedTask);
    } else {
      const completedTask = aggregate.task.complete();
      this.removeAggregate(event.id);
      this.taskStore.mergeExternalTask(completedTask);
    }

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

        if (result.value.completed) {
          this.removeAggregate(event.id);
        } else {
          this.replaceAggregateTask(event.id, result.value);
        }
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

    this.removeAggregate(event.id);
    if (optimisticDeleteSnapshot !== null) {
      this.taskStore.removeTask(event.id);
    }

    this.deleteTaskUseCase.execute(aggregate.projectId, event.sectionId, event.id).subscribe({
      next: () => {
        // Optimistic remove already cleaned state.
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

    if (nextTask.completed) {
      this.removeAggregate(event.id);
    } else {
      this.replaceAggregateTask(event.id, nextTask);
    }
    this.taskStore.mergeExternalTask(nextTask);

    this.updateTaskUseCase.execute(aggregate.projectId, nextTask).subscribe({
      next: (result) => {
        if (!result.success) {
          this.state.set(previousState);
          this.taskStore.rollbackExternalTaskMerge(event.id, priorInTaskStore);
          this.state.update((s) => ({ ...s, error: 'Failed to edit task.' }));
          return;
        }

        if (result.value.completed) {
          this.removeAggregate(event.id);
        } else {
          this.replaceAggregateTask(event.id, result.value);
        }
        this.taskStore.mergeExternalTask(result.value);
      },
      error: () => {
        this.state.set(previousState);
        this.taskStore.rollbackExternalTaskMerge(event.id, priorInTaskStore);
        this.state.update((s) => ({ ...s, error: 'Failed to edit task.' }));
      },
    });
  }

  private toTaskViewModel(task: Task): UpcomingTaskViewModel {
    return {
      id: task.id,
      sectionId: task.sectionId,
      name: task.name,
      completed: task.completed,
      startDate: task.startDate,
      description: task.description,
      endDate: task.endDate,
      subtasks: [],
    };
  }

  private dayLabel(day: Date): string {
    if (day.getTime() === this.today.getTime()) return 'Today';
    if (day.getTime() === this.addDays(this.today, 1).getTime()) return 'Tomorrow';
    return day.toLocaleDateString('en-US', { weekday: 'long' });
  }

  private daysForSelectedWeek(): Date[] {
    const start = this.state().selectedWeekStart;
    return Array.from({ length: 7 }, (_, idx) => this.addDays(start, idx));
  }

  private startOfWeek(inputDate: Date): Date {
    const date = this.dayStart(inputDate);
    const day = date.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    return this.addDays(date, diffToMonday);
  }

  private dayStart(inputDate: Date): Date {
    const date = new Date(inputDate);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private addDays(date: Date, amount: number): Date {
    const next = new Date(date);
    next.setDate(next.getDate() + amount);
    next.setHours(0, 0, 0, 0);
    return next;
  }

  private loadUpcomingTasksForWeek(weekStart: Date): void {
    if (this.state().loading) return;

    const from = this.isCurrentWeekByStart(weekStart) ? this.today : weekStart;
    const to = this.addDays(weekStart, 6);

    this.state.update((s) => ({ ...s, loading: true, error: null }));
    this.loadUpcomingTasksUseCase.execute(from, to).subscribe({
      next: (result) => {
        if (!result.success) {
          this.state.update((s) => ({
            ...s,
            loading: false,
            error: 'Failed to load upcoming tasks.',
          }));
          return;
        }
        this.state.update((s) => ({
          ...s,
          aggregates: result.value,
          loading: false,
          error: null,
        }));
      },
      error: () => {
        this.state.update((s) => ({
          ...s,
          loading: false,
          error: 'Failed to load upcoming tasks.',
        }));
      },
    });
  }

  private isCurrentWeekByStart(weekStart: Date): boolean {
    return weekStart.getTime() === this.currentWeekMonday.getTime();
  }

  private resolveAggregate(taskId: string): UpcomingTaskAggregate | undefined {
    return this.state().aggregates.find((aggregate) => aggregate.task.id === taskId);
  }

  private removeAggregate(taskId: string): void {
    this.state.update((s) => ({
      ...s,
      aggregates: s.aggregates.filter((aggregate) => aggregate.task.id !== taskId),
    }));
  }

  private replaceAggregateTask(taskId: string, nextTask: UpcomingTaskAggregate['task']): void {
    this.state.update((s) => ({
      ...s,
      aggregates: s.aggregates.map((aggregate) =>
        aggregate.task.id === taskId
          ? { ...aggregate, task: nextTask }
          : aggregate,
      ),
    }));
  }
}
