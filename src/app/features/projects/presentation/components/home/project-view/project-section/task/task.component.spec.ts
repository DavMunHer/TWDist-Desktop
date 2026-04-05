import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TaskComponent } from '@features/projects/presentation/components/home/project-view/project-section/task/task.component';
import { provideZonelessChangeDetection } from '@angular/core';
import { TaskViewModel } from '@features/projects/presentation/models/project.view-model';

describe('TaskComponent', () => {
  let component: TaskComponent;
  let fixture: ComponentFixture<TaskComponent>;

  const task: TaskViewModel = {
    id: 't1',
    name: 'Write tests',
    completed: false,
    startDate: new Date(),
    subtasks: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskComponent],
      providers: [provideZonelessChangeDetection()],
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

  it('emits taskToggle when completion control is activated', () => {
    const emitSpy = vi.spyOn(component.taskToggle, 'emit');
    const label: HTMLElement = fixture.nativeElement.querySelector('.completed-button-label');
    label?.click();
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

  it('emits taskDelete when delete is clicked in menu', () => {
    const emitSpy = vi.spyOn(component.taskDelete, 'emit');

    fixture.nativeElement.querySelector('.task-menu-trigger').click();
    fixture.detectChanges();

    const deleteBtn: HTMLElement = fixture.nativeElement.querySelector('.task-menu-item--danger');
    deleteBtn.click();

    expect(emitSpy).toHaveBeenCalledWith({ id: 't1', sectionId: 's1' });
  });
});
