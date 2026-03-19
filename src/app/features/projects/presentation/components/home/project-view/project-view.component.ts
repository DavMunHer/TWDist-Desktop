import { Component, computed, inject, input, output } from '@angular/core';
import { ProjectSectionComponent } from '@features/projects/presentation/components/home/project-view/project-section/project-section.component';
import { SectionAdderComponent } from '@features/projects/presentation/components/home/project-view/section-adder/section-adder.component';
import { BreadcrumbComponent } from '@shared/ui/breadcrumb/breadcrumb.component';
import { SectionViewModel, TaskViewModel } from '@features/projects/presentation/models/project.view-model';
import { ProjectStore } from '@features/projects/presentation/store/project.store';

@Component({
  selector: 'project-view',
  imports: [ProjectSectionComponent, SectionAdderComponent, BreadcrumbComponent],
  templateUrl: './project-view.component.html',
  styleUrl: './project-view.component.css',
})
export class ProjectViewComponent {
  private readonly projectStore = inject(ProjectStore);

  // Tunnel for hidding icon when sidebar is visible
  public showIconChange = output<boolean>();
  public showIcon = input.required<boolean>();

  handleIconChange() {
    this.showIconChange.emit(true)
  }

  /** Denormalized project view-model, ready for the template */
  protected projectInfo = computed(() => this.projectStore.projectView());

  protected updateTaskToCompleted(section: SectionViewModel, task: TaskViewModel) {
    this.projectStore.toggleTaskCompletion(task.id);
  }
}
