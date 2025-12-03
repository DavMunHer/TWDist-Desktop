import { Component, signal } from '@angular/core';
import { SectionTitleComponent } from './section-title/section-title.component';
import { TWDTask } from '../../types/task';
import { TaskComponent } from './task/task.component';

@Component({
  selector: 'app-project-section',
  imports: [SectionTitleComponent, TaskComponent],
  templateUrl: './project-section.component.html',
  styleUrl: './project-section.component.css',
})
export class ProjectSectionComponent {
  // FIXME: The below variable should be initialized doing an http request or via input in the project component
  protected tasksList = signal<TWDTask[]>([
    {
      taskName: 'Task 1',
      completed: false,
      startDate: new Date(),
    },
    {
      taskName: 'Task 2',
      completed: false,
      startDate: new Date(),
    },
    {
      taskName: 'Task 3',
      completed: false,
      startDate: new Date(),
    },
    {
      taskName: 'Task 4',
      completed: false,
      startDate: new Date(),
    },
  ]);

  protected updateTaskToCompleted(task: TWDTask) {
    this.tasksList.update((tasks) =>
      tasks.map((t) => (t === task ? { ...t, completed: !t.completed } : t))
    );
  }
}
