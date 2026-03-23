import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ProjectSectionComponent } from '@features/projects/presentation/components/home/project-view/project-section/project-section.component';
import { provideZonelessChangeDetection } from '@angular/core';
import { SectionViewModel, TaskViewModel } from '@features/projects/presentation/models/project.view-model';
import { TaskComponent } from '@features/projects/presentation/components/home/project-view/project-section/task/task.component';
import { SectionTitleComponent } from '@features/projects/presentation/components/home/project-view/project-section/section-title/section-title.component';

describe('ProjectSectionComponent', () => {
  let component: ProjectSectionComponent;
  let fixture: ComponentFixture<ProjectSectionComponent>;

  const task: TaskViewModel = {
    id: 't1',
    name: 'Do work',
    completed: false,
    startDate: new Date(),
    subtasks: [],
  };

  const section: SectionViewModel = {
    id: 's1',
    name: 'Inbox',
    tasks: [task],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectSectionComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectSectionComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('sectionInfo', section);
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('passes section name to section-title', () => {
    const titleDE = fixture.debugElement.query(By.directive(SectionTitleComponent));
    const titleCmp = titleDE.componentInstance as SectionTitleComponent;
    expect(titleCmp.title()).toBe('Inbox');
  });

  it('renders one task row per task', () => {
    const tasks = fixture.debugElement.queryAll(By.directive(TaskComponent));
    expect(tasks.length).toBe(1);
  });

  it('emits onTaskUpdate when a task reports completion', () => {
    const emitSpy = vi.spyOn(component.taskUpdate, 'emit');
    const taskDE = fixture.debugElement.query(By.directive(TaskComponent));
    taskDE.triggerEventHandler('taskCompleted', undefined);
    expect(emitSpy).toHaveBeenCalledWith(task);
  });
});
