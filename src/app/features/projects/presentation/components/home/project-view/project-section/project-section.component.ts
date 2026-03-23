import { Component, input, output } from '@angular/core';
import { SectionTitleComponent } from '@features/projects/presentation/components/home/project-view/project-section/section-title/section-title.component';
import { TaskComponent } from '@features/projects/presentation/components/home/project-view/project-section/task/task.component';
import { SectionViewModel, TaskViewModel } from '@features/projects/presentation/models/project.view-model';

@Component({
  selector: 'app-project-section',
  imports: [SectionTitleComponent, TaskComponent],
  templateUrl: './project-section.component.html',
  styleUrl: './project-section.component.css',
})
export class ProjectSectionComponent {
  public sectionInfo = input.required<SectionViewModel>();
  public taskUpdate = output<TaskViewModel>();

  protected emitTaskToCompleted(task: TaskViewModel) {
    this.taskUpdate.emit(task);
  }
}
