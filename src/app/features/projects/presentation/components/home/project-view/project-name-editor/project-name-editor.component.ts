import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AutoFocusDirective } from '@shared/directives/auto-focus.directive';

@Component({
  selector: 'app-project-name-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, AutoFocusDirective],
  templateUrl: './project-name-editor.component.html',
  styleUrl: './project-name-editor.component.css',
})
export class ProjectNameEditorComponent {
  public name = input.required<string>();
  public nameChange = output<string>();

  protected editing = signal(false);
  private cancellingEdit = false;

  protected nameCtrl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
  });

  protected get nameError(): string | null {
    const errors = this.nameCtrl.errors;
    if (!errors) return null;
    if (errors['required']) return 'Project name is required';
    if (errors['minlength']) return 'Must be at least 2 characters';
    if (errors['maxlength']) return 'Must be at most 100 characters';
    return null;
  }

  protected onDisplayClick(): void {
    this.nameCtrl.setValue(this.name());
    this.nameCtrl.markAsUntouched();
    this.cancellingEdit = false;
    this.editing.set(true);
  }

  protected onSave(): void {
    if (this.cancellingEdit) {
      this.cancellingEdit = false;
      return;
    }

    if (this.nameCtrl.invalid) {
      this.nameCtrl.markAsTouched();
      return;
    }

    const newName = this.nameCtrl.value.trim();
    if (newName !== this.name()) {
      this.nameChange.emit(newName);
    }
    this.editing.set(false);
  }

  protected onCancel(): void {
    this.cancellingEdit = true;
    this.nameCtrl.markAsUntouched();
    this.editing.set(false);
  }
}
