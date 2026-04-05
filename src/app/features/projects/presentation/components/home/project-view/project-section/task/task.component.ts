import { Component, forwardRef, input, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  TaskDeleteEvent,
  TaskRenameEvent,
  TaskToggleEvent,
  TaskViewModel,
} from '@features/projects/presentation/models/project.view-model';
import { AutoFocusDirective } from '@shared/directives/auto-focus.directive';

@Component({
  selector: 'app-task',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, ReactiveFormsModule, AutoFocusDirective, forwardRef(() => TaskComponent)],
  templateUrl: './task.component.html',
  styleUrl: './task.component.css',
})
export class TaskComponent {
  public taskInfo = input.required<TaskViewModel>();
  public sectionId = input.required<string>();

  public taskToggle = output<TaskToggleEvent>();
  public taskRename = output<TaskRenameEvent>();
  public taskDelete = output<TaskDeleteEvent>();

  protected menuOpen = signal(false);
  protected editing = signal(false);
  private cancellingEdit = false;

  protected taskNameCtrl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
  });

  protected get taskNameError(): string | null {
    const errors = this.taskNameCtrl.errors;
    if (!errors) return null;
    if (errors['required']) return 'Task name is required';
    if (errors['minlength']) return 'Must be at least 2 characters';
    if (errors['maxlength']) return 'Must be at most 50 characters';
    return null;
  }

  protected sendTaskCompletedChange() {
    this.taskToggle.emit({ id: this.taskInfo().id });
  }

  protected toggleMenu(event: Event): void {
    event.stopPropagation();
    this.menuOpen.update((v) => !v);
  }

  protected closeMenu(event: Event): void {
    event.stopPropagation();
    this.menuOpen.set(false);
  }

  protected onEdit(event: Event): void {
    event.stopPropagation();
    this.menuOpen.set(false);
    this.taskNameCtrl.setValue(this.taskInfo().name);
    this.taskNameCtrl.markAsUntouched();
    this.cancellingEdit = false;
    this.editing.set(true);
  }

  protected onSave(): void {
    if (this.cancellingEdit) {
      this.cancellingEdit = false;
      return;
    }

    if (this.taskNameCtrl.invalid) {
      this.taskNameCtrl.markAsTouched();
      return;
    }

    const name = this.taskNameCtrl.value.trim();
    if (name !== this.taskInfo().name) {
      this.taskRename.emit({ id: this.taskInfo().id, name });
    }

    this.editing.set(false);
  }

  protected onCancel(): void {
    this.cancellingEdit = true;
    this.taskNameCtrl.markAsUntouched();
    this.editing.set(false);
  }

  protected onDelete(event: Event): void {
    event.stopPropagation();
    this.menuOpen.set(false);
    this.taskDelete.emit({ id: this.taskInfo().id, sectionId: this.sectionId() });
  }

  protected forwardTaskToggle(event: TaskToggleEvent): void {
    this.taskToggle.emit(event);
  }

  protected forwardTaskRename(event: TaskRenameEvent): void {
    this.taskRename.emit(event);
  }

  protected forwardTaskDelete(event: TaskDeleteEvent): void {
    this.taskDelete.emit(event);
  }
}
