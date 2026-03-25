import { InjectionToken } from '@angular/core';

export const MODAL_DATA = new InjectionToken<Record<string, unknown>>('MODAL_DATA');

export class ModalRef<R = void> {
  constructor(private readonly closeFn: (result?: R) => void) {}

  close(result?: R): void {
    this.closeFn(result);
  }
}
