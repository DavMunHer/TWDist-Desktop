import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  modalType = signal<string | null>(null);
  modalData = signal<any>(null);

  open(type: string, data?: any) {
    this.modalType.set(type);
    this.modalData.set(data ?? null);
  }

  close() {
    this.modalType.set(null);
    this.modalData.set(null);
  }
}
