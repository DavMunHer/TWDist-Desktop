import { Component, computed, inject, input, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectSectionComponent } from '@features/projects/presentation/components/home/project-view/project-section/project-section.component';
import { SectionAdderComponent } from '@features/projects/presentation/components/home/project-view/section-adder/section-adder.component';
import { BreadcrumbComponent } from '@shared/ui/breadcrumb/breadcrumb.component';
import { AutoFocusDirective } from '@shared/directives/auto-focus.directive';
import { SectionDeleteEvent, SectionUpdateEvent, TaskUpdateEvent } from '@features/projects/presentation/models/project.view-model';
import { ProjectStore } from '@features/projects/presentation/store/project.store';

@Component({
  selector: 'app-project-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProjectSectionComponent, SectionAdderComponent, BreadcrumbComponent, ReactiveFormsModule, AutoFocusDirective],
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

  // ── Inline project name editing ──────────────────────────────────────────

  protected editingProjectName = signal(false);
  private cancellingEdit = false;

  protected projectNameCtrl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
  });

  protected get projectNameError(): string | null {
    const errors = this.projectNameCtrl.errors;
    if (!errors) return null;
    if (errors['required']) return 'Project name is required';
    if (errors['minlength']) return 'Must be at least 2 characters';
    if (errors['maxlength']) return 'Must be at most 100 characters';
    return null;
  }

  protected onHeaderClick(): void {
    const current = this.projectInfo()?.name ?? '';
    this.projectNameCtrl.setValue(current);
    this.projectNameCtrl.markAsUntouched();
    this.cancellingEdit = false;
    this.editingProjectName.set(true);
  }

  protected onProjectNameSave(): void {
    // blur fires right after keydown.escape — skip saving in that case
    if (this.cancellingEdit) {
      this.cancellingEdit = false;
      return;
    }

    if (this.projectNameCtrl.invalid) {
      this.projectNameCtrl.markAsTouched();
      return;
    }

    const newName = this.projectNameCtrl.value.trim();
    const info = this.projectInfo();
    if (info && newName !== info.name) {
      this.projectStore.updateProject({
        id: info.id,
        name: newName,
        favorite: this.projectStore.selectedProject()?.favorite ?? false,
        sectionIds: info.sections.map(s => s.id),
      });
    }
    this.editingProjectName.set(false);
  }

  protected onProjectNameCancel(): void {
    this.cancellingEdit = true;
    this.projectNameCtrl.markAsUntouched();
    this.editingProjectName.set(false);
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
