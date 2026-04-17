import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ProjectSectionComponent } from '@features/projects/presentation/components/home/project-view/project-section/project-section.component';
import { provideZonelessChangeDetection } from '@angular/core';
import { SectionViewModel } from '@features/projects/presentation/models/project.view-model';
import { ModalService } from '@shared/ui/modal/modal.service';
import { ConfirmComponent } from '@shared/ui/modal/confirm/confirm.component';

describe('ProjectSectionComponent', () => {
  let component: ProjectSectionComponent;
  let fixture: ComponentFixture<ProjectSectionComponent>;
  let modalServiceMock: { open: ReturnType<typeof vi.fn> };

  const section: SectionViewModel = {
    id: 's1',
    name: 'Inbox',
    taskCount: 0,
    tasks: [],
  };

  beforeEach(async () => {
    modalServiceMock = {
      open: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ProjectSectionComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ModalService, useValue: modalServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectSectionComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('sectionInfo', section);
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('renders the section name', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('.section-name-input');
    expect(input.value).toBe('Inbox');
  });

  it('renders the task count', () => {
    const count: HTMLElement = fixture.nativeElement.querySelector('.section-task-count');
    expect(count.textContent?.trim()).toBe('0');
  });

  it('shows Save and Cancel buttons when editing is active', () => {
    component['editing'].set(true);
    fixture.detectChanges();
    const save: HTMLElement = fixture.nativeElement.querySelector('.section-save-btn');
    const cancel: HTMLElement = fixture.nativeElement.querySelector('.section-cancel-btn');
    expect(save).toBeTruthy();
    expect(cancel).toBeTruthy();
  });

  it('hides Save and Cancel buttons when not editing', () => {
    const save: HTMLElement = fixture.nativeElement.querySelector('.section-save-btn');
    const cancel: HTMLElement = fixture.nativeElement.querySelector('.section-cancel-btn');
    expect(save).toBeNull();
    expect(cancel).toBeNull();
  });

  it('emits sectionUpdate with new name when Save is clicked', () => {
    const emitSpy = vi.spyOn(component.sectionUpdate, 'emit');
    component['editing'].set(true);
    component['sectionNameCtrl'].setValue('New Name');
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.section-save-btn').click();
    expect(emitSpy).toHaveBeenCalledWith({ id: 's1', name: 'New Name' });
  });

  it('opens confirmation modal when Delete is clicked', () => {
    component['menuOpen'].set(true);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.section-menu-item--danger').click();

    expect(modalServiceMock.open).toHaveBeenCalledWith(
      ConfirmComponent,
      expect.objectContaining({
        title: 'Delete Section',
      }),
    );
  });

  it('emits sectionDelete only after confirmation', () => {
    const emitSpy = vi.spyOn(component.sectionDelete, 'emit');
    component['menuOpen'].set(true);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.section-menu-item--danger').click();

    expect(emitSpy).not.toHaveBeenCalled();

    const [, config] = modalServiceMock.open.mock.calls[0] as [
      typeof ConfirmComponent,
      { onClose?: (result?: unknown) => void }
    ];

    config.onClose?.(true);

    expect(emitSpy).toHaveBeenCalledWith({ id: 's1' });
  });

  it('emits taskCreate when adding a valid task name', () => {
    const emitSpy = vi.spyOn(component.taskCreate, 'emit');
    component['openTaskForm']();
    component['newTaskNameCtrl'].setValue('Task from section');
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.task-save-btn').click();
    fixture.detectChanges();

    expect(emitSpy).toHaveBeenCalledWith({ sectionId: 's1', name: 'Task from section' });
    expect(component['showTaskForm']()).toBe(false);
    expect(component['newTaskNameCtrl'].value).toBeFalsy();
    expect(component['showTaskNameErrors']()).toBe(false);
  });
});
