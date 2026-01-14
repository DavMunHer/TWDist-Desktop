import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'create-project-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './create-project.component.html',
  styleUrl: './create-project.component.css'
})
export class CreateProjectComponent {
  protected createProjetForm = new FormGroup({
    projectName: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
    favorite: new FormControl<boolean>(false, { nonNullable: true }),
  });

  create() {
    //TODO Logic for sending the form to the backend
  }

  cancel(){
    //TODO Logic for closing the login modal
  }
}
