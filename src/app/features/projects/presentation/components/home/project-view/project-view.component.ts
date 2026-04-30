import { Component, computed, inject, input, output, ChangeDetectionStrategy, signal } from '@angular/core';
import { ProjectSectionComponent } from '@features/projects/presentation/components/home/project-view/project-section/project-section.component';
import { SectionAdderComponent } from '@features/projects/presentation/components/home/project-view/section-adder/section-adder.component';
import { ProjectNameEditorComponent } from '@features/projects/presentation/components/home/project-view/project-name-editor/project-name-editor.component';
import { BreadcrumbComponent } from '@shared/ui/breadcrumb/breadcrumb.component';
import {
  SectionDeleteEvent,
  SectionUpdateEvent,
  TaskCreateEvent,
  TaskDeleteEvent,
  TaskEditEvent,
  TaskRenameEvent,
  TaskToggleEvent,
} from '@features/projects/presentation/models/project.view-model';
import { ProjectStore } from '@features/projects/presentation/store/project.store';
import { TaskFilter } from '@shared/types/task-filter.type';

@Component({
  selector: 'app-project-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProjectSectionComponent, SectionAdderComponent, ProjectNameEditorComponent, BreadcrumbComponent],
  templateUrl: './project-view.component.html',
  styleUrl: './project-view.component.css',
})
export class ProjectViewComponent {
  private readonly projectStore = inject(ProjectStore);
  protected taskFilter = signal<TaskFilter>('uncompleted');

  // Tunnel for hiding icon when sidebar is visible
  public showIconChange = output<boolean>();
  public showIcon = input.required<boolean>();

  handleIconChange() {
    this.showIconChange.emit(true);
  }

  protected onTaskFilterChange(filter: TaskFilter): void {
    this.taskFilter.set(filter);
  }

  /** Denormalized project view-model, ready for the template */
  protected projectInfo = computed(() => this.projectStore.projectView());

  protected onProjectNameChange(newName: string): void {
    const info = this.projectInfo();
    if (!info) return;
    this.projectStore.updateProject({
      id: info.id,
      name: newName,
      favorite: this.projectStore.selectedProject()?.favorite ?? false,
      sectionIds: info.sections.map(s => s.id),
    });
  }

  // ── Section / Task delegation ─────────────────────────────────────────────

  protected updateTaskToCompleted(event: TaskToggleEvent): void {
    this.projectStore.toggleTaskCompletion(event.id);
  }

  protected onTaskCreate(event: TaskCreateEvent): void {
    this.projectStore.createTask(event.sectionId, event.name);
  }

  protected onTaskRename(event: TaskRenameEvent): void {
    this.projectStore.updateTaskName(event.id, event.name);
  }

  protected onTaskDelete(event: TaskDeleteEvent): void {
    this.projectStore.deleteTask(event.sectionId, event.id);
  }

  protected onTaskEdit(event: TaskEditEvent): void {
    this.projectStore.editTask(event.id, event.name, event.description, event.startDate, event.endDate);
    if (event.completedChanged) {
      this.projectStore.toggleTaskCompletion(event.id);
    }
  }

  protected onSectionUpdate(event: SectionUpdateEvent): void {
    this.projectStore.updateSectionName(event.id, event.name);
  }

  protected onSectionDelete(event: SectionDeleteEvent): void {
    this.projectStore.deleteSectionFromProject(event.id);
  }
}
