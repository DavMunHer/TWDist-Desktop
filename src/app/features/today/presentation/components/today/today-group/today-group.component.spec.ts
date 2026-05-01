import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TodayGroupComponent } from '@features/today/presentation/components/today/today-group/today-group.component';
import { TodayGroupViewModel } from '@features/today/presentation/models/today.view-model';
import { TaskComponent } from '@shared/ui/task/task.component';
import { ModalService } from '@shared/ui/modal/modal.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('TodayGroupComponent', () => {
  let component: TodayGroupComponent;
  let fixture: ComponentFixture<TodayGroupComponent>;

  const modalServiceMock = {
    open: vi.fn(),
  };

  const groupInfo: TodayGroupViewModel = {
    label: 'Today',
    tasks: [
      {
        id: 't1',
        sectionId: 's1',
        name: 'Draft release notes',
        completed: false,
        startDate: new Date('2026-05-01'),
        subtasks: [],
      },
      {
        id: 't2',
        sectionId: 's2',
        name: 'Review API docs',
        completed: true,
        startDate: new Date('2026-05-01'),
        subtasks: [],
      },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodayGroupComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ModalService, useValue: modalServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TodayGroupComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('groupInfo', groupInfo);
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('renders group label and visible task count', () => {
    const label: HTMLElement = fixture.nativeElement.querySelector('.group-name');
    const count: HTMLElement = fixture.nativeElement.querySelector('.group-task-count');
    expect(label.textContent?.trim()).toBe('Today');
    expect(count.textContent?.trim()).toBe('1');
  });

  it('shows only uncompleted tasks by default', () => {
    const tasks = fixture.nativeElement.querySelectorAll('.task-container');
    expect(tasks.length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Draft release notes');
  });

  it('shows only completed tasks when filter is completed', () => {
    fixture.componentRef.setInput('taskFilter', 'completed');
    fixture.detectChanges();

    const tasks = fixture.nativeElement.querySelectorAll('.task-container');
    const count: HTMLElement = fixture.nativeElement.querySelector('.group-task-count');
    expect(tasks.length).toBe(1);
    expect(count.textContent?.trim()).toBe('1');
    expect(fixture.nativeElement.textContent).toContain('Review API docs');
  });

  it('shows all tasks when filter is all', () => {
    fixture.componentRef.setInput('taskFilter', 'all');
    fixture.detectChanges();

    const tasks = fixture.nativeElement.querySelectorAll('.task-container');
    const count: HTMLElement = fixture.nativeElement.querySelector('.group-task-count');
    expect(tasks.length).toBe(2);
    expect(count.textContent?.trim()).toBe('2');
  });

  it('renders empty state when no tasks pass the filter', () => {
    fixture.componentRef.setInput('groupInfo', {
      label: 'Today',
      tasks: [
        {
          id: 'only-open',
          sectionId: 's1',
          name: 'Only open task',
          completed: false,
          startDate: new Date('2026-05-01'),
          subtasks: [],
        },
      ],
    });
    fixture.componentRef.setInput('taskFilter', 'completed');
    fixture.detectChanges();

    const empty: HTMLElement = fixture.nativeElement.querySelector('.empty-state');
    expect(empty).toBeTruthy();
    expect(empty.textContent?.trim()).toBe('No tasks for today in this group.');
  });

  it('forwards task events from child task component', () => {
    const emitSpy = vi.spyOn(component.taskToggle, 'emit');
    const taskDE = fixture.debugElement.query(By.directive(TaskComponent));
    const taskComponent = taskDE.componentInstance as TaskComponent;

    taskComponent.taskToggle.emit({ id: 't1' });

    expect(emitSpy).toHaveBeenCalledWith({ id: 't1' });
  });
});
