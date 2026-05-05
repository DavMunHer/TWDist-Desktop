import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  TaskDeleteEvent,
  TaskEditEvent,
  TaskRenameEvent,
  TaskToggleEvent,
} from '@features/projects/presentation/models/project.view-model';
import { UpcomingGroupComponent } from '@features/upcoming/presentation/components/upcoming/upcoming-group/upcoming-group.component';
import { UpcomingStore } from '@features/upcoming/presentation/store/upcoming.store';
import { TaskFilter } from '@shared/types/task-filter.type';
import { BreadcrumbComponent } from '@shared/ui/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-upcoming',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BreadcrumbComponent, UpcomingGroupComponent],
  templateUrl: './upcoming.component.html',
  styleUrl: './upcoming.component.css',
})
export class UpcomingComponent implements AfterViewInit {
  private readonly upcomingStore = inject(UpcomingStore);

  public showIcon = input.required<boolean>();
  public showIconChange = output<boolean>();
  private readonly groupsContainer = viewChild<ElementRef<HTMLElement>>('groupsContainer');

  protected taskFilter = signal<TaskFilter>('uncompleted');
  protected upcomingGroups = this.upcomingStore.upcomingGroups;
  protected weekRange = this.upcomingStore.weekRange;
  protected isCurrentWeek = this.upcomingStore.isCurrentWeek;
  protected scrollToTodaySignal = this.upcomingStore.scrollToTodaySignal;

  constructor() {
    effect(() => {
      this.scrollToTodaySignal();
      this.scrollTodayColumnIntoView();
    });
  }

  ngAfterViewInit(): void {
    this.scrollTodayColumnIntoView();
  }

  handleIconChange(): void {
    this.showIconChange.emit(true);
  }

  protected onTaskFilterChange(filter: TaskFilter): void {
    this.taskFilter.set(filter);
  }

  protected previousWeek(): void {
    this.upcomingStore.goToPreviousWeek();
  }

  protected nextWeek(): void {
    this.upcomingStore.goToNextWeek();
  }

  protected goToToday(): void {
    this.upcomingStore.goToCurrentWeek();
  }

  protected onTaskToggle(event: TaskToggleEvent): void {
    this.upcomingStore.toggleTaskCompletion(event);
  }

  protected onTaskRename(event: TaskRenameEvent): void {
    this.upcomingStore.renameTask(event);
  }

  protected onTaskDelete(event: TaskDeleteEvent): void {
    this.upcomingStore.deleteTask(event);
  }

  protected onTaskEdit(event: TaskEditEvent): void {
    this.upcomingStore.editTask(event);
  }

  private scrollTodayColumnIntoView(): void {
    queueMicrotask(() => {
      const container = this.groupsContainer()?.nativeElement;
      if (!container) return;
      const todayElement = container.querySelector<HTMLElement>('[data-is-today="true"]');
      if (!todayElement) return;
      if (typeof todayElement.scrollIntoView !== 'function') return;
      todayElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    });
  }
}
