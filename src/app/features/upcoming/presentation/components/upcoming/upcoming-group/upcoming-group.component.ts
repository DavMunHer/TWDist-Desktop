import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import {
  TaskDeleteEvent,
  TaskEditEvent,
  TaskRenameEvent,
  TaskToggleEvent,
} from '@features/projects/presentation/models/project.view-model';
import { UpcomingGroupViewModel } from '@features/upcoming/presentation/models/upcoming.view-model';
import { TaskFilter } from '@shared/types/task-filter.type';
import { TaskComponent } from '@shared/ui/task/task.component';

@Component({
  selector: 'app-upcoming-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TaskComponent],
  templateUrl: './upcoming-group.component.html',
  styleUrl: './upcoming-group.component.css',
})
export class UpcomingGroupComponent {
  public groupInfo = input.required<UpcomingGroupViewModel>();
  public taskFilter = input<TaskFilter>('uncompleted');

  public taskToggle = output<TaskToggleEvent>();
  public taskRename = output<TaskRenameEvent>();
  public taskDelete = output<TaskDeleteEvent>();
  public taskEdit = output<TaskEditEvent>();

  protected filteredTasks = computed(() => {
    const tasks = this.groupInfo().tasks;
    switch (this.taskFilter()) {
      case 'completed':
        return tasks.filter((task) => task.completed);
      case 'uncompleted':
        return tasks.filter((task) => !task.completed);
      default:
        return tasks;
    }
  });

  protected visibleTaskCount = computed(() => this.filteredTasks().length);
}
