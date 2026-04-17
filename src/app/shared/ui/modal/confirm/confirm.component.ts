import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MODAL_DATA, ModalRef } from '@shared/ui/modal/modal-ref';

interface ConfirmModalData {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './confirm.component.html',
  styleUrl: './confirm.component.css',
})
export class ConfirmComponent {
  private readonly modalRef = inject(ModalRef<boolean>);
  private readonly modalData = inject<ConfirmModalData>(MODAL_DATA);

  protected readonly message = this.modalData.message;
  protected readonly confirmLabel = this.modalData.confirmLabel ?? 'Delete';
  protected readonly cancelLabel = this.modalData.cancelLabel ?? 'Cancel';

  protected confirm(): void {
    this.modalRef.close(true);
  }

  protected cancel(): void {
    this.modalRef.close(false);
  }
}