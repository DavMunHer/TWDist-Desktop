import { Component, input, linkedSignal, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AutoFocusDirective } from '@shared/directives/auto-focus.directive';
import {
  SectionDeleteEvent,
  SectionUpdateEvent,
  SectionViewModel,
  TaskCreateEvent,
  TaskDeleteEvent,
  TaskRenameEvent,
  TaskToggleEvent,
} from '@features/projects/presentation/models/project.view-model';
import { TaskComponent } from '@features/projects/presentation/components/home/project-view/project-section/task/task.component';

@Component({
  selector: 'app-project-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, AutoFocusDirective, TaskComponent],
  templateUrl: './project-section.component.html',
  styleUrl: './project-section.component.css',
})
export class ProjectSectionComponent {
  public sectionInfo = input.required<SectionViewModel>();
  public taskToggle = output<TaskToggleEvent>();
  public taskCreate = output<TaskCreateEvent>();
  public taskRename = output<TaskRenameEvent>();
  public taskDelete = output<TaskDeleteEvent>();
  public sectionUpdate = output<SectionUpdateEvent>();
  public sectionDelete = output<SectionDeleteEvent>();

  protected editing = signal(false);
  protected menuOpen = signal(false);
  protected showTaskForm = signal(false);
  protected showTaskNameErrors = signal(false);

  protected sectionName = linkedSignal({
    source: () => this.sectionInfo().name,
    computation: (newName: string) => newName,
  });

  protected sectionNameCtrl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
  });

  protected newTaskNameCtrl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
  });

  protected get sectionNameError(): string | null {
    const errors = this.sectionNameCtrl.errors;
    if (!errors) return null;
    if (errors['required']) return 'Section name is required';
    if (errors['minlength']) return 'Must be at least 2 characters';
    if (errors['maxlength']) return 'Must be at most 50 characters';
    return null;
  }

  protected get taskNameError(): string | null {
    const errors = this.newTaskNameCtrl.errors;
    if (!errors) return null;
    if (errors['required']) return 'Task name is required';
    if (errors['minlength']) return 'Must be at least 2 characters';
    if (errors['maxlength']) return 'Must be at most 50 characters';
    return null;
  }

  protected toggleMenu(event: Event): void {
    event.stopPropagation();
    this.menuOpen.update(v => !v);
  }

  protected closeMenu(event: Event): void {
    event.stopPropagation();
    this.menuOpen.set(false);
  }

  protected onEdit(event: Event): void {
    event.stopPropagation();
    this.menuOpen.set(false);
    this.sectionNameCtrl.setValue(this.sectionName());
    this.editing.set(true);
  }

  protected onSave(): void {
    if (this.sectionNameCtrl.invalid) {
      this.sectionNameCtrl.markAsTouched();
      return;
    }

    const name = this.sectionNameCtrl.value.trim();
    if (name !== this.sectionName()) {
      this.sectionUpdate.emit({ id: this.sectionInfo().id, name });
    }
    this.editing.set(false);
  }

  protected onCancel(): void {
    this.sectionNameCtrl.setValue(this.sectionName());
    this.sectionNameCtrl.markAsUntouched();
    this.editing.set(false);
  }

  protected onDelete(event: Event): void {
    event.stopPropagation();
    this.menuOpen.set(false);
    this.sectionDelete.emit({ id: this.sectionInfo().id });
  }

  protected openTaskForm(): void {
    this.showTaskNameErrors.set(false);
    this.showTaskForm.set(true);
  }

  protected closeTaskForm(): void {
    this.showTaskNameErrors.set(false);
    this.newTaskNameCtrl.reset();
    this.showTaskForm.set(false);
  }

  protected createTask(event: Event): void {
    event.preventDefault();

    if (this.newTaskNameCtrl.invalid) {
      this.showTaskNameErrors.set(true);
      this.newTaskNameCtrl.markAsTouched();
      return;
    }

    this.taskCreate.emit({
      sectionId: this.sectionInfo().id,
      name: this.newTaskNameCtrl.value.trim(),
    });

    this.newTaskNameCtrl.reset();
    this.showTaskNameErrors.set(false);
  }

  protected onTaskToggle(event: TaskToggleEvent): void {
    this.taskToggle.emit(event);
  }

  protected onTaskRename(event: TaskRenameEvent): void {
    this.taskRename.emit(event);
  }

  protected onTaskDelete(event: TaskDeleteEvent): void {
    this.taskDelete.emit(event);
  }
}
