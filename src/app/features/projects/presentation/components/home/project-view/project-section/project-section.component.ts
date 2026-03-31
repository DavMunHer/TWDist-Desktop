import { Component, input, linkedSignal, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { SectionDeleteEvent, SectionUpdateEvent, SectionViewModel, TaskUpdateEvent } from '@features/projects/presentation/models/project.view-model';

@Component({
  selector: 'app-project-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './project-section.component.html',
  styleUrl: './project-section.component.css',
})
export class ProjectSectionComponent {
  public sectionInfo = input.required<SectionViewModel>();
  public taskUpdate = output<TaskUpdateEvent>();
  public sectionUpdate = output<SectionUpdateEvent>();
  public sectionDelete = output<SectionDeleteEvent>();

  protected editing = signal(false);
  protected menuOpen = signal(false);

  protected sectionName = linkedSignal({
    source: () => this.sectionInfo().name,
    computation: (newName: string) => newName,
  });

  protected sectionNameCtrl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
  });

  protected get sectionNameError(): string | null {
    const errors = this.sectionNameCtrl.errors;
    if (!errors) return null;
    if (errors['required']) return 'Section name is required';
    if (errors['minlength']) return 'Must be at least 2 characters';
    if (errors['maxlength']) return 'Must be at most 50 characters';
    return null;
  }

  protected toggleMenu(event: Event): void {
    event.stopPropagation();
    this.menuOpen.update(v => !v);
  }

  protected closeMenu(event: Event): void {
    event.stopPropagation();
    this.menuOpen.set(false);
  }

  protected onEdit(event: Event): void {
    event.stopPropagation();
    this.menuOpen.set(false);
    this.sectionNameCtrl.setValue(this.sectionName());
    this.editing.set(true);
  }

  protected onSave(): void {
    if (this.sectionNameCtrl.invalid) {
      this.sectionNameCtrl.markAsTouched();
      return;
    }

    const name = this.sectionNameCtrl.value.trim();
    if (name !== this.sectionName()) {
      this.sectionUpdate.emit({ id: this.sectionInfo().id, name });
    }
    this.editing.set(false);
  }

  protected onCancel(): void {
    this.sectionNameCtrl.setValue(this.sectionName());
    this.sectionNameCtrl.markAsUntouched();
    this.editing.set(false);
  }

  protected onDelete(event: Event): void {
    event.stopPropagation();
    this.menuOpen.set(false);
    this.sectionDelete.emit({ id: this.sectionInfo().id });
  }
}
