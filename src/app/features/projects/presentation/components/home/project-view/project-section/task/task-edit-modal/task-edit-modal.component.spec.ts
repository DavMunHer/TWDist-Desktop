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
    expect(modalRef.close).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Write release notes',
      description: 'Details',
      completed: false,
    }));
  });

  it('does not close the modal when start date is before today', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const year = yesterday.getFullYear();
    const month = `${yesterday.getMonth() + 1}`.padStart(2, '0');
    const day = `${yesterday.getDate()}`.padStart(2, '0');
    const yesterdayInputValue = `${year}-${month}-${day}`;

    const startDateInput: HTMLInputElement = fixture.nativeElement.querySelector('#startDate');
    startDateInput.value = yesterdayInputValue;
    startDateInput.dispatchEvent(new Event('input'));
    startDateInput.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(modalRef.close).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Start date cannot be before today');
  });

  it('allows saving after clearing start date', () => {
    const startDateInput: HTMLInputElement = fixture.nativeElement.querySelector('#startDate');
    const clearStartDateButton: HTMLButtonElement = fixture.nativeElement.querySelector('#clearStartDate');

    clearStartDateButton.click();
    fixture.detectChanges();

    expect(startDateInput.value).toBe('');

    const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));

    expect(modalRef.close).toHaveBeenCalled();
  });

  it('clears end date when clear end date is clicked', () => {
    const endDateInput: HTMLInputElement = fixture.nativeElement.querySelector('#endDate');
    const clearEndDateButton: HTMLButtonElement = fixture.nativeElement.querySelector('#clearEndDate');

    endDateInput.value = '2099-01-01';
    endDateInput.dispatchEvent(new Event('input'));
    endDateInput.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    clearEndDateButton.click();
    fixture.detectChanges();

    expect(endDateInput.value).toBe('');
  });
});
