import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { ModalService } from '@shared/ui/modal/modal.service';

describe('Service template (signals)', () => {
  let service: ModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModalService);
  });

  it('creates the service', () => {
    expect(service).toBeTruthy();
  });

  it('updates and resets state', () => {
    service.open('profile', { userId: 'u-1' });

    expect(service.modalType()).toBe('profile');
    expect(service.modalData()).toEqual({ userId: 'u-1' });

    service.close();

    expect(service.modalType()).toBeNull();
    expect(service.modalData()).toBeNull();
  });
});
