import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateProjectComponent } from '@features/projects/presentation/components/create-project/create-project.component';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ProjectStore } from '@features/projects/presentation/store/project.store';
import { vi } from 'vitest';



describe('CreateProjectComponent', () => {
  let component: CreateProjectComponent;
  let fixture: ComponentFixture<CreateProjectComponent>;

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
      imports: [CreateProjectComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ProjectStore, useValue: projectStoreMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
