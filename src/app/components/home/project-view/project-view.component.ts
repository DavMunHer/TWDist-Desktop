import { Component, input, output, signal } from '@angular/core';
import { ProjectSectionComponent } from './project-section/project-section.component';
import { SectionAdderComponent } from './section-adder/section-adder.component';
import { BreadcrumbComponent } from "./breadcrumb/breadcrumb.component";
import { ProjectView, SectionView, TaskView } from '../../../models/model-views/view.types';

@Component({
  selector: 'project-view',
  imports: [ProjectSectionComponent, SectionAdderComponent, BreadcrumbComponent],
  templateUrl: './project-view.component.html',
  styleUrl: './project-view.component.css',
})
export class ProjectViewComponent {
  // Tunnel for hidding icon when sidebar is visible
  public onShowIconChange = output<boolean>();
  public showIcon = input.required<boolean>();

  handleIconChange() {
    this.onShowIconChange.emit(true)
  }

  // FIXME: The below variable should be initialized doing an http request
  protected projectInfo = signal<ProjectView>({
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
  });

  // FIXME: Change this logic using either immer or ngrx/signals -> patchState when we need to update many thing from subcomponents
  protected updateTaskToCompleted(section: SectionView, task: TaskView) {
    this.projectInfo.update((project: ProjectView) => {
      return {
        ...project,
        sectionsList: project.sectionsList.map((s: SectionView) => {
          if (s.id != section.id) return s;
          return {
            ...s,
            tasksList: section.tasksList.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t))
          }
        })
      }
    })
  }

  protected handleSectionAddition(newSection: SectionView) {
    this.projectInfo.update((project: ProjectView) => {
      return {
        ...project,
        sectionsList: [...project.sectionsList, newSection]
      }
    })
  }
}
