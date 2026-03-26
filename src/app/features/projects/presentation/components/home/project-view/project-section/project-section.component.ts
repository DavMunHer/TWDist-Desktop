import { Component, input, OnInit, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SectionDeleteEvent, SectionUpdateEvent, SectionViewModel, TaskUpdateEvent } from '@features/projects/presentation/models/project.view-model';

@Component({
  selector: 'app-project-section',
  imports: [ReactiveFormsModule],
  templateUrl: './project-section.component.html',
  styleUrl: './project-section.component.css',
})
export class ProjectSectionComponent implements OnInit {
  public sectionInfo = input.required<SectionViewModel>();
  public taskUpdate = output<TaskUpdateEvent>();
  public sectionUpdate = output<SectionUpdateEvent>();
  public sectionDelete = output<SectionDeleteEvent>();

  protected editing = signal(false);
  protected menuOpen = signal(false);

  protected sectionNameCtrl = new FormControl('', { nonNullable: true });

  ngOnInit(): void {
    this.sectionNameCtrl.setValue(this.sectionInfo().name);
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
    this.editing.set(true);
    this.sectionNameCtrl.setValue(this.sectionInfo().name);
  }

  protected onSave(): void {
    const name = this.sectionNameCtrl.value.trim();
    if (name && name !== this.sectionInfo().name) {
      this.sectionUpdate.emit({ id: this.sectionInfo().id, name });
    }
    this.editing.set(false);
  }

  protected onCancel(): void {
    this.sectionNameCtrl.setValue(this.sectionInfo().name);
    this.editing.set(false);
  }

  protected onDelete(event: Event): void {
    event.stopPropagation();
    this.menuOpen.set(false);
    this.sectionDelete.emit({ id: this.sectionInfo().id });
  }
}
