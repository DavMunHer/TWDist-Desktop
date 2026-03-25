import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateProjectComponent } from '@features/projects/presentation/components/create-project/create-project.component';
import { ProjectStore } from '@features/projects/presentation/store/project.store';
import { ModalRef } from '@shared/ui/modal/modal-ref';

describe('CreateProjectComponent', () => {
  let component: CreateProjectComponent;
  let fixture: ComponentFixture<CreateProjectComponent>;

  const projectStoreMock = {
    createProject: vi.fn(),
  };

  const modalRefMock = {
    close: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [CreateProjectComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ProjectStore, useValue: projectStoreMock },
        { provide: ModalRef, useValue: modalRefMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('submit() calls projectStore.createProject and closes the modal', () => {
    (component as unknown as { projectForm: FormGroup }).projectForm.patchValue({
      projectName: 'longenough',
      favorite: true,
    });

    component.submit();

    expect(projectStoreMock.createProject).toHaveBeenCalledWith({
      name: 'longenough',
      favorite: true,
    });
    expect(modalRefMock.close).toHaveBeenCalled();
  });

  it('cancel() closes the modal', () => {
    component.cancel();
    expect(modalRefMock.close).toHaveBeenCalled();
  });
});
