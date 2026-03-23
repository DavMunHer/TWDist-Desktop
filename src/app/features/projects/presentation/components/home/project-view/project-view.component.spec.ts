import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectViewComponent } from '@features/projects/presentation/components/home/project-view/project-view.component';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ProjectStore } from '@features/projects/presentation/store/project.store';
import { vi } from 'vitest';


describe('ProjectViewComponent', () => {
  let component: ProjectViewComponent;
  let fixture: ComponentFixture<ProjectViewComponent>;

  const projectStoreMock = {
    projects: signal([]),
    projectView: signal(null),
    selectedProjectId: signal<string | null>(null),
    loadAllProjects: vi.fn(),
    loadProject: vi.fn(),
    toggleProjectFavorite: vi.fn(),
    deleteProject: vi.fn(),
    disconnectFromEvents: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectViewComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ProjectStore, useValue: projectStoreMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectViewComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('showIcon', false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
