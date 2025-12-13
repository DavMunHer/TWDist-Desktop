import { Component, input, output, signal } from '@angular/core';
import { SectionTitleComponent } from './section-title/section-title.component';
import { TaskComponent } from './task/task.component';
import { SectionView, TaskView } from '../../../../models/model-views/view.types';

@Component({
  selector: 'project-section',
  imports: [SectionTitleComponent, TaskComponent],
  templateUrl: './project-section.component.html',
  styleUrl: './project-section.component.css',
})
export class ProjectSectionComponent {
  public sectionInfo = input.required<SectionView>();
  public onTaskUpdate = output<TaskView>();

  protected emitTaskToCompleted(task: TaskView) {
    this.onTaskUpdate.emit(task);
  }
}
