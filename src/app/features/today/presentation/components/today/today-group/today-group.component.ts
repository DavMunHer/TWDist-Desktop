import { Component, computed, input, output, ChangeDetectionStrategy } from '@angular/core';
import { TaskComponent } from '@shared/ui/task/task.component';
import {
  TaskDeleteEvent,
  TaskEditEvent,
  TaskRenameEvent,
  TaskToggleEvent,
} from '@features/projects/presentation/models/project.view-model';
import { TodayGroupViewModel } from '@features/today/presentation/models/today.view-model';
import { TaskFilter } from '@shared/types/task-filter.type';

@Component({
  selector: 'app-today-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TaskComponent],
  templateUrl: './today-group.component.html',
  styleUrl: './today-group.component.css',
})
export class TodayGroupComponent {
  public groupInfo = input.required<TodayGroupViewModel>();
  public taskFilter = input<TaskFilter>('uncompleted');

  public taskToggle = output<TaskToggleEvent>();
  public taskRename = output<TaskRenameEvent>();
  public taskDelete = output<TaskDeleteEvent>();
  public taskEdit = output<TaskEditEvent>();

  protected filteredTasks = computed(() => {
    const tasks = this.groupInfo().tasks;
    switch (this.taskFilter()) {
      case 'completed':
        return tasks.filter(t => t.completed);
      case 'uncompleted':
        return tasks.filter(t => !t.completed);
      default:
        return tasks;
    }
  });

  protected visibleTaskCount = computed(() => this.filteredTasks().length);
}
