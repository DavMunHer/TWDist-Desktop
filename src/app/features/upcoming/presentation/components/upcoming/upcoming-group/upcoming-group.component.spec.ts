import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UpcomingGroupComponent } from '@features/upcoming/presentation/components/upcoming/upcoming-group/upcoming-group.component';
import { UpcomingGroupViewModel } from '@features/upcoming/presentation/models/upcoming.view-model';
import { ModalService } from '@shared/ui/modal/modal.service';
import { TaskComponent } from '@shared/ui/task/task.component';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('UpcomingGroupComponent', () => {
  let component: UpcomingGroupComponent;
  let fixture: ComponentFixture<UpcomingGroupComponent>;

  const modalServiceMock = {
    open: vi.fn(),
  };

  const groupInfo: UpcomingGroupViewModel = {
    label: 'Today',
    dateLabel: '6 May',
    isToday: true,
    tasks: [
      {
        id: 'u1',
        sectionId: 's1',
        name: 'Prepare weekly report',
        completed: false,
        startDate: new Date('2026-05-06'),
        subtasks: [],
      },
      {
        id: 'u2',
        sectionId: 's2',
        name: 'Review deployment checklist',
        completed: true,
        startDate: new Date('2026-05-06'),
        subtasks: [],
      },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpcomingGroupComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ModalService, useValue: modalServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UpcomingGroupComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('groupInfo', groupInfo);
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('renders date label, group label, and visible task count', () => {
    const date: HTMLElement = fixture.nativeElement.querySelector('.group-header-date');
    const label: HTMLElement = fixture.nativeElement.querySelector('.group-name');
    const count: HTMLElement = fixture.nativeElement.querySelector('.group-task-count');

    expect(date.textContent?.trim()).toBe('6 May');
    expect(label.textContent?.trim()).toBe('Today');
    expect(count.textContent?.trim()).toBe('1');
  });

  it('shows only uncompleted tasks by default', () => {
    const tasks = fixture.nativeElement.querySelectorAll('.task-container');
    expect(tasks.length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Prepare weekly report');
  });

  it('shows only completed tasks when filter is completed', () => {
    fixture.componentRef.setInput('taskFilter', 'completed');
    fixture.detectChanges();

    const tasks = fixture.nativeElement.querySelectorAll('.task-container');
    const count: HTMLElement = fixture.nativeElement.querySelector('.group-task-count');
    expect(tasks.length).toBe(1);
    expect(count.textContent?.trim()).toBe('1');
    expect(fixture.nativeElement.textContent).toContain('Review deployment checklist');
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
      label: 'Friday',
      dateLabel: '8 May',
      isToday: false,
      tasks: [
        {
          id: 'open-only',
          sectionId: 's1',
          name: 'Open task',
          completed: false,
          startDate: new Date('2026-05-08'),
          subtasks: [],
        },
      ],
    });
    fixture.componentRef.setInput('taskFilter', 'completed');
    fixture.detectChanges();

    const empty: HTMLElement = fixture.nativeElement.querySelector('.empty-state');
    expect(empty).toBeTruthy();
    expect(empty.textContent?.trim()).toBe('No tasks for this day.');
  });

  it('forwards task events from child task component', () => {
    const emitSpy = vi.spyOn(component.taskToggle, 'emit');
    const taskDE = fixture.debugElement.query(By.directive(TaskComponent));
    const taskComponent = taskDE.componentInstance as TaskComponent;

    taskComponent.taskToggle.emit({ id: 'u1' });

    expect(emitSpy).toHaveBeenCalledWith({ id: 'u1' });
  });
});
