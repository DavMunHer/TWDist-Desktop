import { Injectable, signal, Type } from '@angular/core';

export interface ModalConfig {
  title: string;
  data?: Record<string, unknown>;
  onClose?: (result?: unknown) => void;
}

export interface ActiveModal {
  component: Type<unknown>;
  config: ModalConfig;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  readonly activeModal = signal<ActiveModal | null>(null);

  open<C>(component: Type<C>, config: ModalConfig): void {
    this.activeModal.set({ component, config });
  }

  close(result?: unknown): void {
    const modal = this.activeModal();
    this.activeModal.set(null);
    modal?.config.onClose?.(result);
  }
}
