import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionAdderComponent } from '@features/projects/presentation/components/home/project-view/section-adder/section-adder.component';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ProjectStore } from '@features/projects/presentation/store/project.store';
import { vi } from 'vitest';


describe('SectionAdderComponent', () => {
  let component: SectionAdderComponent;
  let fixture: ComponentFixture<SectionAdderComponent>;

  const projectStoreMock = {
    projects: signal([]),
    selectedProjectId: signal<string | null>(null),
    loadAllProjects: vi.fn(),
    loadProject: vi.fn(),
    toggleProjectFavorite: vi.fn(),
    deleteProject: vi.fn(),
    disconnectFromEvents: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionAdderComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ProjectStore, useValue: projectStoreMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectionAdderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
