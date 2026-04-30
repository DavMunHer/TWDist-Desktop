import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AutoFocusDirective } from '@shared/directives/auto-focus.directive';
import { MODAL_DATA, ModalRef } from '@shared/ui/modal/modal-ref';
import { TaskEditModalState, TaskEditModalResult } from '@features/projects/presentation/models/task-edit-modal.state';

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
  protected readonly todayDateInput = this.toDateInputValue(new Date());

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
      validators: [this.minTodayDateValidator()],
    }),
    endDate: new FormControl(this.toDateInputValue(this.modalData?.endDate), {
      nonNullable: true,
    }),
  }, { validators: [this.endDateAfterStartDateValidator()] });

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

  protected get startDateError(): string | null {
    const errors = this.taskForm.controls.startDate.errors;
    if (!errors) return null;
    if (errors['minToday']) return 'Start date cannot be before today';
    return null;
  }

  protected get endDateError(): string | null {
    if (this.taskForm.hasError('endBeforeStartDate')) {
      return 'End date cannot be before start date';
    }
    return null;
  }

  protected clearStartDate(): void {
    this.taskForm.controls.startDate.setValue('');
    this.taskForm.controls.startDate.markAsTouched();
    this.taskForm.controls.startDate.updateValueAndValidity();
  }

  protected clearEndDate(): void {
    this.taskForm.controls.endDate.setValue('');
    this.taskForm.controls.endDate.markAsTouched();
    this.taskForm.controls.endDate.updateValueAndValidity();
  }

  protected save(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const { name, description, startDate, endDate } = this.taskForm.getRawValue();
    this.modalRef.close({
      name,
      description,
      startDate,
      endDate,
      completed: this.completed(),
    } satisfies TaskEditModalResult);
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

  private minTodayDateValidator(): ValidatorFn {
    return (control: AbstractControl<string>): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const selectedDate = new Date(`${value}T00:00:00`);
      if (Number.isNaN(selectedDate.getTime())) return null;

      return selectedDate < today ? { minToday: true } : null;
    };
  }

  private endDateAfterStartDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const group = control as FormGroup<{
        startDate: FormControl<string>;
        endDate: FormControl<string>;
      }>;

      const startValue = group.controls.startDate.value;
      const endValue = group.controls.endDate.value;
      if (!startValue || !endValue) return null;

      const startDate = new Date(`${startValue}T00:00:00`);
      const endDate = new Date(`${endValue}T00:00:00`);
      if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return null;

      return endDate < startDate ? { endBeforeStartDate: true } : null;
    };
  }
}
