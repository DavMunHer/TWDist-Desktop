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
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('renders task name', () => {
    const nameEl: HTMLElement = fixture.nativeElement.querySelector('.task-name-container');
    expect(nameEl?.textContent?.trim()).toBe('Write tests');
  });

  it('emits taskCompleted when completion control is activated', () => {
    const emitSpy = vi.spyOn(component.taskCompleted, 'emit');
    const label: HTMLElement = fixture.nativeElement.querySelector('.completed-button-label');
    label?.click();
    // Clicking the <label> runs its (click) handler and, in jsdom, can also activate the nested
    // checkbox, so sendTaskCompletedChange() may run more than once. We use toHaveBeenCalled()
    // to assert the output fired without depending on that duplicate synthetic behavior.
    expect(emitSpy).toHaveBeenCalled();
  });

  it('applies completed class on name when task is completed', () => {
    fixture.componentRef.setInput('taskInfo', { ...task, completed: true });
    fixture.detectChanges();
    const nameEl: HTMLElement = fixture.nativeElement.querySelector('.task-name-container');
    expect(nameEl?.classList.contains('completed')).toBe(true);
  });
});
