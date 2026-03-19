import { Injectable, signal } from '@angular/core';
import { TWDModalType } from './modals-type';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  modalType = signal<TWDModalType | null>(null);
  modalData = signal<any>(null);

  open(type: TWDModalType, data?: any) {
    this.modalType.set(type);
    this.modalData.set(data ?? null);
  }

  close() {
    this.modalType.set(null);
    this.modalData.set(null);
  }
}
