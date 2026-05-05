import { computed, Injectable, signal } from '@angular/core';
import { Task } from '@features/projects/domain/entities/task.entity';
import {
  TaskDeleteEvent,
  TaskEditEvent,
  TaskRenameEvent,
  TaskToggleEvent,
} from '@features/projects/presentation/models/project.view-model';
import {
  UpcomingGroupViewModel,
  UpcomingTaskViewModel,
  WeekRange,
} from '@features/upcoming/presentation/models/upcoming.view-model';
import { TodayTaskAggregate } from '@features/today/domain/models/today-task.aggregate';
import { initialUpcomingState, UpcomingState } from '@features/upcoming/presentation/models/upcoming.state';

@Injectable({ providedIn: 'root' })
export class UpcomingStore {
  private readonly today = this.dayStart(new Date());
  private readonly currentWeekMonday = this.startOfWeek(this.today);
  private readonly state = signal<UpcomingState>(
    initialUpcomingState(this.currentWeekMonday),
  );
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

  constructor() {
    this.loadMockTasks();
  }

  goToPreviousWeek(): void {
    if (this.isCurrentWeek()) return;
    this.state.update((s) => ({
      ...s,
      selectedWeekStart: this.addDays(s.selectedWeekStart, -7),
    }));
  }

  goToNextWeek(): void {
    this.state.update((s) => ({
      ...s,
      selectedWeekStart: this.addDays(s.selectedWeekStart, 7),
    }));
  }

  goToCurrentWeek(): void {
    this.state.update((s) => ({
      ...s,
      selectedWeekStart: this.currentWeekMonday,
    }));
    this.scrollToTodayTick.update((tick) => tick + 1);
  }

  toggleTaskCompletion(event: TaskToggleEvent): void {
    this.state.update((s) => ({
      ...s,
      aggregates: s.aggregates.map((aggregate) =>
        aggregate.task.id === event.id
          ? {
              ...aggregate,
              task: aggregate.task.completed ? aggregate.task.uncomplete() : aggregate.task.complete(),
            }
          : aggregate,
      ),
    }));
  }

  renameTask(event: TaskRenameEvent): void {
    this.state.update((s) => ({
      ...s,
      aggregates: s.aggregates.map((aggregate) =>
        aggregate.task.id === event.id
          ? { ...aggregate, task: aggregate.task.updateName(event.name.trim()) }
          : aggregate,
      ),
    }));
  }

  deleteTask(event: TaskDeleteEvent): void {
    this.state.update((s) => ({
      ...s,
      aggregates: s.aggregates.filter((aggregate) => aggregate.task.id !== event.id),
    }));
  }

  editTask(event: TaskEditEvent): void {
    this.state.update((s) => ({
      ...s,
      aggregates: s.aggregates.map((aggregate) => {
        if (aggregate.task.id !== event.id) return aggregate;
        const normalizedDescription = event.description?.trim() ? event.description.trim() : undefined;
        const editedTask = aggregate.task
          .updateName(event.name.trim())
          .updateDescription(normalizedDescription ?? '')
          .setStartDate(event.startDate)
          .setEndDate(event.endDate);

        const completedTask = event.completedChanged
          ? (editedTask.completed ? editedTask.uncomplete() : editedTask.complete())
          : editedTask;

        return { ...aggregate, task: completedTask };
      }),
    }));
  }

  private loadMockTasks(): void {
    const monday = this.currentWeekMonday;
    const aggregates = [
      this.createAggregate('task-1', 'sec-1', 'Review Angular signals', this.today, 'DAM'),
      this.createAggregate('task-2', 'sec-1', 'Solve Python exercises 4-9', this.today, 'DAW'),
      this.createAggregate('task-3', 'sec-2', 'Prepare MongoDB exam notes', this.addDays(this.today, 1), 'DAM'),
      this.createAggregate('task-4', 'sec-3', 'English academy speaking practice', this.addDays(this.today, 2), 'English Academy'),
      this.createAggregate('task-5', 'sec-4', 'Finalize project architecture draft', this.addDays(this.today, 3), 'Final Project'),
      this.createAggregate('task-6', 'sec-4', 'Refactor auth module', this.addDays(this.today, 4), 'Final Project'),
      this.createAggregate('task-7', 'sec-5', 'Write API contract tests', this.addDays(monday, 7), 'DAW'),
      this.createAggregate('task-8', 'sec-5', 'Implement upcoming store integration', this.addDays(monday, 8), 'DAW'),
      this.createAggregate('task-9', 'sec-6', 'Prepare presentation slides', this.addDays(monday, 10), 'English Academy'),
      this.createAggregate('task-10', 'sec-7', 'Mock backend payload for week 3', this.addDays(monday, 14), 'Final Project'),
      this.createAggregate('task-11', 'sec-7', 'Review clean architecture boundaries', this.addDays(monday, 15), 'Final Project'),
      this.createAggregate('task-12', 'sec-8', 'Polish UI spacing for columns', this.addDays(monday, 18), 'DAW'),
    ];

    this.state.update((s) => ({
      ...s,
      aggregates,
    }));
  }

  private createAggregate(
    id: string,
    sectionId: string,
    name: string,
    startDate: Date,
    projectName: string,
  ): TodayTaskAggregate {
    return {
      task: new Task(id, sectionId, name, false, startDate, '', undefined, undefined, undefined, undefined, []),
      projectId: sectionId,
      projectName,
    };
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
}
