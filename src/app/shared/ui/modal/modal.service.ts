import { Injectable, signal } from '@angular/core';
import { TWDModalType } from '@shared/ui/modal/modals-type';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  modalType = signal<TWDModalType | null>(null);
  modalData = signal<unknown>(null);

  open(type: TWDModalType, data?: unknown) {
    this.modalType.set(type);
    this.modalData.set(data ?? null);
  }

  close() {
    this.modalType.set(null);
    this.modalData.set(null);
  }
}
