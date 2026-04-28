import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AutoFocusDirective } from '@shared/directives/auto-focus.directive';
import { MODAL_DATA, ModalRef } from '@shared/ui/modal/modal-ref';
import { TaskEditModalState } from '@features/projects/presentation/models/task-edit-modal.state';

@Component({
  selector: 'app-task-edit-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, AutoFocusDirective],
  templateUrl: './task-edit-modal.component.html',
  styleUrl: './task-edit-modal.component.css',
})
export class TaskEditModalComponent {
  private readonly modalRef = inject(ModalRef);
  private readonly modalData = inject<TaskEditModalState | null>(MODAL_DATA, { optional: true });

  protected readonly completed = signal(this.modalData?.completed ?? false);

  protected readonly taskForm = new FormGroup({
    name: new FormControl(this.modalData?.name ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
    }),
    description: new FormControl(this.modalData?.description ?? '', {
      nonNullable: true,
      validators: [Validators.maxLength(500)],
    }),
    startDate: new FormControl(this.toDateInputValue(this.modalData?.startDate), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    endDate: new FormControl(this.toDateInputValue(this.modalData?.endDate), {
      nonNullable: true,
    }),
  });

  protected get nameError(): string | null {
    const errors = this.taskForm.controls.name.errors;
    if (!errors) return null;
    if (errors['required']) return 'Task name is required';
    if (errors['minlength']) return 'Must be at least 2 characters';
    if (errors['maxlength']) return 'Must be at most 50 characters';
    return null;
  }

  protected toggleCompletion(): void {
    this.completed.update((v) => !v);
  }

  protected save(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.modalRef.close();
  }

  protected cancel(): void {
    this.modalRef.close();
  }

  private toDateInputValue(date?: Date | null): string {
    if (!date) return '';

    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
