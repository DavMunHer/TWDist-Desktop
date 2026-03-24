import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateProjectComponent } from '@features/projects/presentation/components/create-project/create-project.component';
import { ProjectStore } from '@features/projects/presentation/store/project.store';

describe('CreateProjectComponent', () => {
  let component: CreateProjectComponent;
  let fixture: ComponentFixture<CreateProjectComponent>;

  const projectStoreMock = {
    createProject: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [CreateProjectComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ProjectStore, useValue: projectStoreMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('create() calls projectStore.createProject and emits closeModal', () => {
    const closeSpy = vi.spyOn(component.closeModal, 'emit');
    component['createProjetForm'].patchValue({
      projectName: 'longenough',
      favorite: true,
    });

    component.create();

    expect(projectStoreMock.createProject).toHaveBeenCalledWith({
      name: 'longenough',
      favorite: true,
    });
    expect(closeSpy).toHaveBeenCalled();
  });

  it('cancel() emits closeModal', () => {
    const closeSpy = vi.spyOn(component.closeModal, 'emit');
    component.cancel();
    expect(closeSpy).toHaveBeenCalled();
  });
});
