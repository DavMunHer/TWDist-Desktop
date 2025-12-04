import { Component, input, output, signal } from '@angular/core';
import { SectionTitleComponent } from './section-title/section-title.component';
import { TaskComponent } from './task/task.component';
import { TWDTask } from '../../../types/task';
import { TWDSection } from '../../../types/section';

@Component({
  selector: 'project-section',
  imports: [SectionTitleComponent, TaskComponent],
  templateUrl: './project-section.component.html',
  styleUrl: './project-section.component.css',
})
export class ProjectSectionComponent {
  public sectionInfo = input.required<TWDSection>();
  public onTaskUpdate = output<TWDTask>();

  protected updateTaskToCompleted(task: TWDTask) {
    this.onTaskUpdate.emit(task);
    // this.tasksList.update((tasks) =>
    //   tasks.map((t) => (t === task ? { ...t, completed: !t.completed } : t))
    // );
  }
}
