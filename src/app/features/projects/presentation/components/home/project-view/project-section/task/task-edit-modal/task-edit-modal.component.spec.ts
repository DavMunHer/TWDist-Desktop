import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TaskEditModalComponent } from './task-edit-modal.component';
import { MODAL_DATA, ModalRef } from '@shared/ui/modal/modal-ref';

describe('TaskEditModalComponent', () => {
  let fixture: ComponentFixture<TaskEditModalComponent>;
  let modalRef: ModalRef<void>;

  beforeEach(async () => {
    modalRef = { close: vi.fn() } as unknown as ModalRef<void>;

    await TestBed.configureTestingModule({
      imports: [TaskEditModalComponent],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: MODAL_DATA,
          useValue: {
            id: 't1',
            name: 'Write release notes',
            completed: false,
            description: 'Details',
            startDate: new Date(),
          },
        },
        { provide: ModalRef, useValue: modalRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskEditModalComponent);
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the provided name in the input', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('#taskName');
    expect(input.value).toBe('Write release notes');
  });

  it('closes the modal when save is submitted', () => {
    const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    expect(modalRef.close).toHaveBeenCalled();
  });
});
