import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SessionHintService {
  private readonly storageKey = 'has_session';

  hasSessionHint(): boolean {
    return !!localStorage.getItem(this.storageKey);
  }

  markAuthenticated(): void {
    localStorage.setItem(this.storageKey, 'true');
  }

  clear(): void {
    localStorage.removeItem(this.storageKey);
  }
}