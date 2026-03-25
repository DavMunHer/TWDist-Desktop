import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectStore } from '@features/projects/presentation/store/project.store';
import { MODAL_DATA, ModalRef } from '@shared/ui/modal/modal-ref';

interface EditProjectData {
  id: string;
  name: string;
  favorite: boolean;
  sectionIds: readonly string[];
}

@Component({
  selector: 'app-create-project-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './create-project.component.html',
  styleUrl: './create-project.component.css'
})
export class CreateProjectComponent {
  private readonly modalRef = inject(ModalRef);
  private readonly projectStore = inject(ProjectStore);
  private readonly modalData = inject<EditProjectData | null>(MODAL_DATA, { optional: true });

  protected readonly isEditMode = !!this.modalData?.id;

  protected projectForm = new FormGroup({
    projectName: new FormControl<string>(this.modalData?.name ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
    }),
    favorite: new FormControl<boolean>(this.modalData?.favorite ?? false, { nonNullable: true }),
  });

  submit() {
    if (this.projectForm.invalid) return;

    const name = this.projectForm.controls.projectName.value;
    const favorite = this.projectForm.controls.favorite.value;

    if (this.isEditMode && this.modalData) {
      this.projectStore.updateProject({
        id: this.modalData.id,
        name,
        favorite,
        sectionIds: this.modalData.sectionIds,
      });
    } else {
      this.projectStore.createProject({ name, favorite });
    }

    this.modalRef.close();
  }

  cancel() {
    this.modalRef.close();
  }
}
