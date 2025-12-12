import { Component, output, signal } from '@angular/core';
import { AutoFocusDirective } from '../../../directives/auto-focus.directive';
import { TWDSection } from '../../../types/section';
import { ReactiveFormsModule, FormControl } from '@angular/forms'
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'section-adder',
  imports: [AutoFocusDirective, ReactiveFormsModule],
  templateUrl: './section-adder.component.html',
  styleUrl: './section-adder.component.css'
})
export class SectionAdderComponent {
  protected showSectionForm = signal<boolean>(false)
  public onNewSectionCreated = output<TWDSection>()

  protected newSectionName = new FormControl('', {nonNullable: true});
  protected newSectionSig = toSignal(this.newSectionName.valueChanges, {initialValue: ''})

  protected handleClick() {
    this.showSectionForm.set(true);
  }

  protected openSectionForm() {
    // This will also hid the current "Add section" button, being replaced by the section form
    this.showSectionForm.set(true)
  }
  
  protected closeSectionForm() {
    // When section form is closed, the add section button appears again!
    this.showSectionForm.set(false);
  }

  protected handleFormSubmission() {
    // TODO: Send info of the form to the backend
    const newSection: TWDSection = {
      name: this.newSectionSig(),
      tasksList: []
    }
    this.onNewSectionCreated.emit(newSection);
    this.closeSectionForm()
  }

}
