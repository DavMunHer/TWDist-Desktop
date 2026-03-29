import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { ModalService } from '@shared/ui/modal/modal.service';

@Component({ selector: 'app-template-stub', template: '', standalone: true })
class TemplateStubComponent {}

describe('Service template (signals)', () => {
  let service: ModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(ModalService);
  });

  it('creates the service', () => {
    expect(service).toBeTruthy();
  });

  it('updates and resets state', () => {
    service.open(TemplateStubComponent, {
      title: 'Profile',
      data: { userId: 'u-1' },
    });

    expect(service.activeModal()?.component).toBe(TemplateStubComponent);
    expect(service.activeModal()?.config.title).toBe('Profile');
    expect(service.activeModal()?.config.data).toEqual({ userId: 'u-1' });

    service.close();

    expect(service.activeModal()).toBeNull();
  });
});
