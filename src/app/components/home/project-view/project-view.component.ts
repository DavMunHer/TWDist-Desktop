import { Component, computed, inject, input, OnInit, output } from '@angular/core';
import { ProjectSectionComponent } from './project-section/project-section.component';
import { SectionAdderComponent } from './section-adder/section-adder.component';
import { BreadcrumbComponent } from "./breadcrumb/breadcrumb.component";
import { SectionViewModel, TaskViewModel } from '../../../features/projects/presentation/models/project.view-model';
import { ProjectStore } from '../../../features/projects/presentation/store/project.store';

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

  /** Denormalized project view-model, ready for the template */
  protected projectInfo = computed(() => this.projectStore.projectView());

  ngOnInit(): void {
    // Load project - in real app, get ID from route params
    this.projectStore.loadProject('1');
  }

  protected updateTaskToCompleted(section: SectionViewModel, task: TaskViewModel) {
    this.projectStore.toggleTaskCompletion(task.id);
  }

  protected handleSectionAddition(newSection: SectionViewModel) {
    this.projectStore.createSection(newSection.name);
  }
}
