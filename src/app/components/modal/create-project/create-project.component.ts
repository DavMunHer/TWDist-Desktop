import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectStore } from '../../../features/projects/presentation/store/project.store';

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

  private projectStore = inject(ProjectStore);

  create() {
    this.projectStore.createProject({
      name: this.createProjetForm.controls.projectName.value,
      favorite: this.createProjetForm.controls.favorite.value,
    });
  }

  cancel(){
    //TODO Logic for closing the login modal
  }
}
