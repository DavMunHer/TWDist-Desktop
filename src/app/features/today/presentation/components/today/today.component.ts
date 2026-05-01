import { Component, effect, inject, input, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { BreadcrumbComponent } from '@shared/ui/breadcrumb/breadcrumb.component';
import { TodayGroupComponent } from '@features/today/presentation/components/today/today-group/today-group.component';
import { TodayStore } from '@features/today/presentation/store/today.store';
import {
  TaskDeleteEvent,
  TaskEditEvent,
  TaskRenameEvent,
  TaskToggleEvent,
} from '@features/projects/presentation/models/project.view-model';
import { TaskFilter } from '@shared/types/task-filter.type';

@Component({
  selector: 'app-today',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BreadcrumbComponent, TodayGroupComponent],
  templateUrl: './today.component.html',
  styleUrl: './today.component.css',
})
export class TodayComponent {
  private readonly todayStore = inject(TodayStore);

  public showIcon = input.required<boolean>();
  public showIconChange = output<boolean>();

  protected taskFilter = signal<TaskFilter>('uncompleted');
  protected todayGroups = this.todayStore.todayGroups;
  protected loading = this.todayStore.loading;
  protected error = this.todayStore.error;
  protected loaded = this.todayStore.loaded;

  protected readonly todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  private readonly ensureLoaded = effect(() => {
    if (!this.loaded()) {
      this.todayStore.ensureTodayTasksLoaded();
    }
  });

  handleIconChange(): void {
    this.showIconChange.emit(true);
  }

  protected onTaskFilterChange(filter: TaskFilter): void {
    this.taskFilter.set(filter);
  }

  protected onTaskToggle(event: TaskToggleEvent): void {
    this.todayStore.toggleTaskCompletion(event);
  }

  protected onTaskRename(event: TaskRenameEvent): void {
    this.todayStore.renameTask(event);
  }

  protected onTaskDelete(event: TaskDeleteEvent): void {
    this.todayStore.deleteTask(event);
  }

  protected onTaskEdit(event: TaskEditEvent): void {
    this.todayStore.editTask(event);
  }

  protected retryLoadTodayTasks(): void {
    this.todayStore.loadTodayTasks();
  }
}
