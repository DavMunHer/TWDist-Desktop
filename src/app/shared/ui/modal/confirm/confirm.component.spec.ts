import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ConfirmComponent } from '@shared/ui/modal/confirm/confirm.component';
import { MODAL_DATA, ModalRef } from '@shared/ui/modal/modal-ref';

describe('ConfirmComponent', () => {
  let fixture: ComponentFixture<ConfirmComponent>;
  let modalRef: ModalRef<boolean>;

  beforeEach(async () => {
    modalRef = { close: vi.fn() } as unknown as ModalRef<boolean>;

    await TestBed.configureTestingModule({
      imports: [ConfirmComponent],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: MODAL_DATA,
          useValue: {
            entityName: 'Inbox',
            cascadeMessage: 'This will also delete all tasks in this section.',
            confirmLabel: 'Delete',
            cancelLabel: 'Cancel',
          },
        },
        { provide: ModalRef, useValue: modalRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmComponent);
    fixture.detectChanges();
  });

  it('renders confirmation message with bold entity name and permanent warning', () => {
    const message = fixture.nativeElement.querySelector('.confirm-modal-message') as HTMLElement;
    const strongElements = Array.from(message.querySelectorAll('strong')) as HTMLElement[];

    expect(message.textContent).toContain('Are you sure you want to delete');
    expect(message.textContent).toContain('This will also delete all tasks in this section.');
    expect(strongElements[0]?.textContent).toBe('"Inbox"');
    expect(strongElements[1]?.textContent).toBe('permanently');
  });

  it('closes with false when cancel is clicked', () => {
    const cancelButton = fixture.nativeElement.querySelector('.confirm-modal-cancel') as HTMLButtonElement;
    cancelButton.click();

    expect(modalRef.close).toHaveBeenCalledWith(false);
  });

  it('closes with true when confirm is clicked', () => {
    const confirmButton = fixture.nativeElement.querySelector('.confirm-modal-confirm') as HTMLButtonElement;
    confirmButton.click();

    expect(modalRef.close).toHaveBeenCalledWith(true);
  });
});
