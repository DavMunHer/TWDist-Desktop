import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ProjectViewComponent } from '@features/projects/presentation/components/home/project-view/project-view.component';
import { ProjectStore } from '@features/projects/presentation/store/project.store';
import { provideZonelessChangeDetection } from '@angular/core';
import { BreadcrumbComponent } from '@shared/ui/breadcrumb/breadcrumb.component';
import { ProjectSectionComponent } from '@features/projects/presentation/components/home/project-view/project-section/project-section.component';
import {
  ProjectViewModel,
  SectionViewModel,
  TaskViewModel,
} from '@features/projects/presentation/models/project.view-model';

describe('ProjectViewComponent', () => {
  let component: ProjectViewComponent;
  let fixture: ComponentFixture<ProjectViewComponent>;

  const task: TaskViewModel = {
    id: 't1',
    name: 'Task one',
    completed: false,
    startDate: new Date('2025-01-01'),
    subtasks: [],
  };

  const section: SectionViewModel = {
    id: 's1',
    name: 'Section A',
    tasks: [task],
  };

  const projectVm: ProjectViewModel = {
    id: 'p1',
    name: 'My project',
    sections: [section],
  };

  const projectViewSig = signal<ProjectViewModel | null>(projectVm);

  const projectStoreMock = {
    projectView: projectViewSig.asReadonly(),
    toggleTaskCompletion: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    projectViewSig.set(projectVm);

    await TestBed.configureTestingModule({
      imports: [ProjectViewComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ProjectStore, useValue: projectStoreMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectViewComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('showIcon', false);
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('renders project name in header', () => {
    const header: HTMLElement = fixture.nativeElement.querySelector('.project-header');
    expect(header?.textContent?.trim()).toBe('My project');
  });

  it('renders a project-section per section in view model', () => {
    const sections = fixture.debugElement.queryAll(By.directive(ProjectSectionComponent));
    expect(sections.length).toBe(1);
  });

  it('emits showIconChange when breadcrumb icon is clicked', () => {
    const emitSpy = vi.spyOn(component.showIconChange, 'emit');
    const breadcrumbDE = fixture.debugElement.query(By.directive(BreadcrumbComponent));
    breadcrumbDE.triggerEventHandler('onIconClick', true);
    expect(emitSpy).toHaveBeenCalledWith(true);
  });

  it('delegates task completion to project store when section emits task', () => {
    const sectionDE = fixture.debugElement.query(By.directive(ProjectSectionComponent));
    sectionDE.triggerEventHandler('onTaskUpdate', task);
    expect(projectStoreMock.toggleTaskCompletion).toHaveBeenCalledWith('t1');
  });

  it('shows empty header when projectView is null', () => {
    projectViewSig.set(null);
    fixture.detectChanges();
    const header: HTMLElement = fixture.nativeElement.querySelector('.project-header');
    expect(header?.textContent?.trim()).toBe('');
  });
});
