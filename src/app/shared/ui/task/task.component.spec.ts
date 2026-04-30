import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { provideZonelessChangeDetection } from '@angular/core';
import { TaskComponent } from '@shared/ui/task/task.component';
import { TaskEditModalComponent } from '@shared/ui/task/task-edit-modal/task-edit-modal.component';
import { TaskViewModel } from '@features/projects/presentation/models/project.view-model';
import { ConfirmComponent } from '@shared/ui/modal/confirm/confirm.component';
import { ModalService } from '@shared/ui/modal/modal.service';

describe('TaskComponent', () => {
  let component: TaskComponent;
  let fixture: ComponentFixture<TaskComponent>;
  let modalServiceMock: { open: ReturnType<typeof vi.fn> };

  const task: TaskViewModel = {
    id: 't1',
    name: 'Write tests',
    completed: false,
    startDate: new Date(),
    subtasks: [],
  };

  beforeEach(async () => {
    modalServiceMock = {
      open: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [TaskComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ModalService, useValue: modalServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('taskInfo', task);
    fixture.componentRef.setInput('sectionId', 's1');
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('renders task name', () => {
    const nameEl: HTMLElement = fixture.nativeElement.querySelector('.task-name-container');
    expect(nameEl?.textContent?.trim()).toBe('Write tests');
  });

  it('opens the task edit modal when the card is clicked', () => {
    fixture.nativeElement.querySelector('.task-container').click();

    expect(modalServiceMock.open).toHaveBeenCalledWith(
      TaskEditModalComponent,
      expect.objectContaining({
        title: 'Edit Task',
      }),
    );
  });

  it('does not open the task edit modal from the completion control', () => {
    fixture.nativeElement.querySelector('.completed-button-container').click();

    expect(modalServiceMock.open).not.toHaveBeenCalled();
  });

  it('does not open the task edit modal from the menu trigger', () => {
    fixture.nativeElement.querySelector('.task-menu-trigger').click();

    expect(modalServiceMock.open).not.toHaveBeenCalled();
  });

  it('emits taskToggle when completion control is activated', () => {
    const emitSpy = vi.spyOn(component.taskToggle, 'emit');
    const input: HTMLInputElement = fixture.nativeElement.querySelector('.completed-button');
    input.checked = true;
    input.dispatchEvent(new Event('change'));
    expect(emitSpy).toHaveBeenCalledWith({ id: 't1' });
  });

  it('applies completed class on name when task is completed', () => {
    fixture.componentRef.setInput('taskInfo', { ...task, completed: true });
    fixture.detectChanges();
    const nameEl: HTMLElement = fixture.nativeElement.querySelector('.task-name-container');
    expect(nameEl?.classList.contains('completed')).toBe(true);
  });

  it('emits taskRename when Enter is pressed in edit mode', () => {
    const emitSpy = vi.spyOn(component.taskRename, 'emit');

    fixture.nativeElement.querySelector('.task-menu-trigger').click();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.task-menu-item').click();
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('.task-name-input');
    input.value = 'Renamed task';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    expect(emitSpy).toHaveBeenCalledWith({ id: 't1', name: 'Renamed task' });
  });

  it('does not render save/cancel buttons in edit mode', () => {
    fixture.nativeElement.querySelector('.task-menu-trigger').click();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.task-menu-item').click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.task-save-btn')).toBeNull();
    expect(fixture.nativeElement.querySelector('.task-cancel-btn')).toBeNull();
  });

  it('opens confirmation modal when delete is clicked in menu', () => {
    fixture.nativeElement.querySelector('.task-menu-trigger').click();
    fixture.detectChanges();

    const deleteBtn: HTMLElement = fixture.nativeElement.querySelector('.task-menu-item--danger');
    deleteBtn.click();

    expect(modalServiceMock.open).toHaveBeenCalledWith(
      ConfirmComponent,
      expect.objectContaining({
        title: 'Delete Task',
      }),
    );
  });

  it('emits taskDelete only after confirmation', () => {
    const emitSpy = vi.spyOn(component.taskDelete, 'emit');

    fixture.nativeElement.querySelector('.task-menu-trigger').click();
    fixture.detectChanges();

    const deleteBtn: HTMLElement = fixture.nativeElement.querySelector('.task-menu-item--danger');
    deleteBtn.click();

    expect(emitSpy).not.toHaveBeenCalled();

    const [, config] = modalServiceMock.open.mock.calls[0] as [
      typeof ConfirmComponent,
      { onClose?: (result?: unknown) => void }
    ];

    config.onClose?.(true);

    expect(emitSpy).toHaveBeenCalledWith({ id: 't1', sectionId: 's1' });
  });
});
