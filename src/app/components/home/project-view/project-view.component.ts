import { Component, computed, inject, input, OnInit, output } from '@angular/core';
import { ProjectSectionComponent } from './project-section/project-section.component';
import { SectionAdderComponent } from './section-adder/section-adder.component';
import { BreadcrumbComponent } from "./breadcrumb/breadcrumb.component";
import { ProjectViewModel, SectionViewModel, TaskViewModel } from '../../../features/projects/presentation/models/project.view-model';
import { ProjectStore } from '../../../features/projects';

@Component({
  selector: 'project-view',
  imports: [ProjectSectionComponent, SectionAdderComponent, BreadcrumbComponent],
  templateUrl: './project-view.component.html',
  styleUrl: './project-view.component.css',
})
export class ProjectViewComponent implements OnInit {
  private projectStore = inject(ProjectStore);

  // Tunnel for hidding icon when sidebar is visible
  public onShowIconChange = output<boolean>();
  public showIcon = input.required<boolean>();

  handleIconChange() {
    this.onShowIconChange.emit(true)
  }

  protected projectInfo = computed(() => this.projectStore.projectView());

  ngOnInit(): void {
    // Load project - in real app, get ID from route params
    this.projectStore.loadProject('1');
  }

  // Keeping old mock data as fallback (will be removed after testing)
  private mockProjectInfo = {
    id: "1",
    name: 'Project 1',
    sectionsList: [
      {
        id: "1",
        name: 'Very large section title that should be managed properly',
        tasksList: [
          {
            id: "1",
            taskName: 'Very long task name that should fit if everything has been properly managed',
            completed: false,
            startDate: new Date(),
          },
          {
            id: "2",
            taskName: 'Task 2',
            completed: false,
            startDate: new Date(),
          },
        ],
      },
      {
        id: "2",
        name: 'Section 2',
        tasksList: [
          {
            id: "3",
            taskName: 'Task 1',
            completed: false,
            startDate: new Date(),
          },
          {
            id: "4",
            taskName: 'Task 2',
            completed: false,
            startDate: new Date(),
          },
        ],
      },
    ],
  };

  // FIXME: Change this logic using either immer or ngrx/signals -> patchState when we need to update many thing from subcomponents
  protected updateTaskToCompleted(section: SectionViewModel, task: TaskViewModel) {
    // TODO: Implement using use case
    console.log('Toggle task completion:', task.id);
    // this.toggleTaskCompletionUseCase.execute(task.id).subscribe();
  }

  protected handleSectionAddition(newSection: SectionViewModel) {
    // TODO: Implement using use case
    console.log('Add section:', newSection);
    // this.createSectionUseCase.execute(projectId, newSection.name).subscribe();
  }
}
