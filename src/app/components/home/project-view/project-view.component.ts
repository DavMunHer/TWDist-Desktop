import { Component, computed, inject, input, OnInit, output } from '@angular/core';
import { ProjectSectionComponent } from './project-section/project-section.component';
import { SectionAdderComponent } from './section-adder/section-adder.component';
import { BreadcrumbComponent } from "./breadcrumb/breadcrumb.component";
import { ProjectViewModel, SectionViewModel, TaskViewModel } from '../../../features/projects/presentation/models/project.view-model';
import { ProjectStore } from '../../../features/projects/presentation/store/project.store';
import { ToggleTaskCompletionUseCase } from '../../../features/projects/application/use-cases/toggle-task-completion.use-case';
import { CreateSectionUseCase } from '../../../features/projects/application/use-cases/create-section.use-case';

@Component({
  selector: 'project-view',
  imports: [ProjectSectionComponent, SectionAdderComponent, BreadcrumbComponent],
  templateUrl: './project-view.component.html',
  styleUrl: './project-view.component.css',
})
export class ProjectViewComponent implements OnInit {
  private projectStore = inject(ProjectStore);
  private toggleTaskCompletionUseCase = inject(ToggleTaskCompletionUseCase);
  private createSectionUseCase = inject(CreateSectionUseCase);

  // Tunnel for hidding icon when sidebar is visible
  public onShowIconChange = output<boolean>();
  public showIcon = input.required<boolean>();

  handleIconChange() {
    this.onShowIconChange.emit(true)
  }

  // TODO Manage the state
  // protected projectInfo = computed(() => this.projectStore.projectView());

  ngOnInit(): void {
    // Load project - in real app, get ID from route params
    this.projectStore.loadProject('1');
  }

  protected updateTaskToCompleted(section: SectionViewModel, task: TaskViewModel) {
    this.toggleTaskCompletionUseCase.execute(task.id).subscribe({
      next: (updatedTask) => {
        console.log('Task toggled:', updatedTask);
        // The store will handle re-rendering automatically via signals
      },
      error: (error) => {
        console.error('Failed to toggle task:', error);
      },
    });
  }

  protected handleSectionAddition(newSection: SectionViewModel) {
    // Get project ID from current project
    const projectId = this.projectInfo()?.id;
    if (!projectId) {
      console.error('No project loaded');
      return;
    }

    this.createSectionUseCase.execute(projectId, newSection.name).subscribe({
      next: (createdSection) => {
        console.log('Section created:', createdSection);
        // The store will handle re-rendering automatically via signals
      },
      error: (error) => {
        console.error('Failed to create section:', error);
      },
    });
  }
}
