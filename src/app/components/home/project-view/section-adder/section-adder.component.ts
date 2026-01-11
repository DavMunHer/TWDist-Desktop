import { Component, input, output, signal } from '@angular/core';
import { AutoFocusDirective } from '../../../../directives/auto-focus.directive';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { SectionViewModel } from '../../../../features/projects/presentation/models/project.view-model';

@Component({
  selector: 'section-adder',
  imports: [AutoFocusDirective, ReactiveFormsModule],
  templateUrl: './section-adder.component.html',
  styleUrl: './section-adder.component.css',
})
export class SectionAdderComponent {
  protected showSectionForm = signal<boolean>(false);

  public onNewSectionCreated = output<SectionViewModel>();

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
    event.preventDefault() // For not reloading the page when sending form
    // TODO: Send info of the form to the backend and show feedback to the user when something went wrong
    const newSection: SectionViewModel = {
      id: crypto.randomUUID(),
      name: this.newSectionSig(),
      tasks: [],
    };
    this.onNewSectionCreated.emit(newSection);
    this.newSectionNameCtrl.reset();
    this.closeSectionForm();
  }
}
