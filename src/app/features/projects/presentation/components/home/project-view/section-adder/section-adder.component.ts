import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { AutoFocusDirective } from '@shared/directives/auto-focus.directive';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProjectStore } from '@features/projects/presentation/store/project.store';

@Component({
  selector: 'app-section-adder',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AutoFocusDirective, ReactiveFormsModule],
  templateUrl: './section-adder.component.html',
  styleUrl: './section-adder.component.css',
})
export class SectionAdderComponent {
  private readonly projectStore = inject(ProjectStore);

  protected showSectionForm = signal<boolean>(false);
  /** True only after an invalid submit; avoids showing errors on blur when clicking Cancel. */
  protected showSectionNameErrors = signal(false);

  protected newSectionNameCtrl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
  });
  protected newSectionSig = toSignal(this.newSectionNameCtrl.valueChanges, {
    initialValue: '',
  });

  protected get sectionNameError(): string | null {
    const errors = this.newSectionNameCtrl.errors;
    if (!errors) return null;
    if (errors['required']) return 'Section name is required';
    if (errors['minlength']) return 'Must be at least 2 characters';
    if (errors['maxlength']) return 'Must be at most 50 characters';
    return null;
  }

  protected handleClick() {
    this.showSectionNameErrors.set(false);
    this.showSectionForm.set(true);
  }

  protected openSectionForm() {
    // This will also hide the current "Add section" button, being replaced by the section form
    this.showSectionNameErrors.set(false);
    this.showSectionForm.set(true);
  }

  protected closeSectionForm() {
    // When section form is closed, the add section button appears again
    this.showSectionNameErrors.set(false);
    this.newSectionNameCtrl.reset();
    this.showSectionForm.set(false);
  }

  protected handleFormSubmission(event: Event) {
    event.preventDefault();

    if (this.newSectionNameCtrl.invalid) {
      this.showSectionNameErrors.set(true);
      this.newSectionNameCtrl.markAsTouched();
      return;
    }

    this.projectStore.createSection(this.newSectionNameCtrl.value.trim());
    this.newSectionNameCtrl.reset();
    this.closeSectionForm();
  }
}
