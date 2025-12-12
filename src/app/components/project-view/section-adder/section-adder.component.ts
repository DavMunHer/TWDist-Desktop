import { Component, output, signal } from '@angular/core';
import { AutoFocusDirective } from '../../../directives/auto-focus.directive';

@Component({
  selector: 'section-adder',
  imports: [AutoFocusDirective],
  templateUrl: './section-adder.component.html',
  styleUrl: './section-adder.component.css'
})
export class SectionAdderComponent {
  protected showSectionForm = signal<boolean>(false)


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
    this.closeSectionForm()
  }

}
