import { Component, signal } from '@angular/core';
import { TWDProject } from '../../types/project';
import { TWDTask } from '../../types/task';
import { TWDSection } from '../../types/section';
import { ProjectSectionComponent } from './project-section/project-section.component';
import { SectionAdderComponent } from './section-adder/section-adder.component';
import { BreadcrumbComponent } from "./breadcrumb/breadcrumb.component";

@Component({
  selector: 'project-view',
  imports: [ProjectSectionComponent, SectionAdderComponent, BreadcrumbComponent],
  templateUrl: './project-view.component.html',
  styleUrl: './project-view.component.css',
})
export class ProjectViewComponent {
  // FIXME: The below variable should be initialized doing an http request
  protected projectInfo = signal<TWDProject>({
    name: 'Project 1',
    sectionsList: [
      {
        name: 'Section example',
        tasksList: [
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
        ],
      },
      {
        name: 'Section 2',
        tasksList: [
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
        ],
      },
    ],
  });

  // FIXME: Change this logic using either immer or ngrx/signals -> patchState when we need to update many thing from subcomponents
  protected updateTaskToCompleted(section: TWDSection, task: TWDTask) {
    this.projectInfo.update((project: TWDProject) => {
      return {
        ...project,
        sectionsList: project.sectionsList.map((s: TWDSection) => {
          if (s !== section) return s;
          return {
            ...s,
            tasksList: section.tasksList.map((t) => (t === task ? { ...t, completed: !t.completed } : t))
          }
        })
      }
    })
  }
}
