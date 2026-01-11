import { Component, input, output, signal } from '@angular/core';
import { SectionTitleComponent } from './section-title/section-title.component';
import { TaskComponent } from './task/task.component';
import { SectionViewModel, TaskViewModel } from '../../../../features/projects/presentation/models/project.view-model';

@Component({
  selector: 'project-section',
  imports: [SectionTitleComponent, TaskComponent],
  templateUrl: './project-section.component.html',
  styleUrl: './project-section.component.css',
})
export class ProjectSectionComponent {
  public sectionInfo = input.required<SectionViewModel>();
  public onTaskUpdate = output<TaskViewModel>();

  protected emitTaskToCompleted(task: TaskViewModel) {
    this.onTaskUpdate.emit(task);
  }
}
