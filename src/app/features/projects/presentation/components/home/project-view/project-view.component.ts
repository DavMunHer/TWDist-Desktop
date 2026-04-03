import { Component, computed, inject, input, output, ChangeDetectionStrategy } from '@angular/core';
import { ProjectSectionComponent } from '@features/projects/presentation/components/home/project-view/project-section/project-section.component';
import { SectionAdderComponent } from '@features/projects/presentation/components/home/project-view/section-adder/section-adder.component';
import { ProjectNameEditorComponent } from '@features/projects/presentation/components/home/project-view/project-name-editor/project-name-editor.component';
import { BreadcrumbComponent } from '@shared/ui/breadcrumb/breadcrumb.component';
import { SectionDeleteEvent, SectionUpdateEvent, TaskUpdateEvent } from '@features/projects/presentation/models/project.view-model';
import { ProjectStore } from '@features/projects/presentation/store/project.store';

@Component({
  selector: 'app-project-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProjectSectionComponent, SectionAdderComponent, ProjectNameEditorComponent, BreadcrumbComponent],
  templateUrl: './project-view.component.html',
  styleUrl: './project-view.component.css',
})
export class ProjectViewComponent {
  private readonly projectStore = inject(ProjectStore);

  // Tunnel for hiding icon when sidebar is visible
  public showIconChange = output<boolean>();
  public showIcon = input.required<boolean>();

  handleIconChange() {
    this.showIconChange.emit(true);
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

  protected updateTaskToCompleted(event: TaskUpdateEvent): void {
    this.projectStore.toggleTaskCompletion(event.id);
  }

  protected onSectionUpdate(event: SectionUpdateEvent): void {
    this.projectStore.updateSectionName(event.id, event.name);
  }

  protected onSectionDelete(event: SectionDeleteEvent): void {
    this.projectStore.deleteSectionFromProject(event.id);
  }
}
