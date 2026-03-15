import { Component, inject, signal } from '@angular/core';
import { AutoFocusDirective } from '@shared/directives/auto-focus.directive';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProjectStore } from '@features/projects/presentation/store/project.store';

@Component({
  selector: 'section-adder',
  imports: [AutoFocusDirective, ReactiveFormsModule],
  templateUrl: './section-adder.component.html',
  styleUrl: './section-adder.component.css',
})
export class SectionAdderComponent {
  private readonly projectStore = inject(ProjectStore);

  protected showSectionForm = signal<boolean>(false);

  protected newSectionNameCtrl = new FormControl('', { nonNullable: true });
  protected newSectionSig = toSignal(this.newSectionNameCtrl.valueChanges, {
    initialValue: '',
  });

  protected handleClick() {
    this.showSectionForm.set(true);
  }

  protected openSectionForm() {
    // This will also hid the current "Add section" button, being replaced by the section form
    this.showSectionForm.set(true);
  }

  protected closeSectionForm() {
    // When section form is closed, the add section button appears again!
    this.showSectionForm.set(false);
  }

  protected handleFormSubmission(event: Event) {
    event.preventDefault(); // For not reloading the page when sending form

    const name = this.newSectionSig().trim();
    if (!name) {
      return;
    }

    this.projectStore.createSection(name);
    this.newSectionNameCtrl.reset();
    this.closeSectionForm();
  }
}
