import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ModalService } from '@shared/ui/modal/modal.service';

@Component({ selector: 'app-stub', template: '', standalone: true })
class StubComponent {}

@Component({ selector: 'app-stub-b', template: '', standalone: true })
class StubBComponent {}

describe('ModalService', () => {
  let service: ModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('opens a modal with component and config', () => {
    service.open(StubComponent, { title: 'Test Modal' });

    expect(service.activeModal()?.component).toBe(StubComponent);
    expect(service.activeModal()?.config.title).toBe('Test Modal');
  });

  it('opens a modal with optional data', () => {
    service.open(StubComponent, { title: 'With Data', data: { foo: 'bar' } });

    expect(service.activeModal()?.config.data).toEqual({ foo: 'bar' });
  });

  it('opens a modal with null data when not provided', () => {
    service.open(StubComponent, { title: 'No Data' });

    expect(service.activeModal()?.config.data).toBeUndefined();
  });

  it('replaces the active modal when opened twice', () => {
    service.open(StubComponent, { title: 'First' });
    service.open(StubBComponent, { title: 'Second' });

    expect(service.activeModal()?.component).toBe(StubBComponent);
    expect(service.activeModal()?.config.title).toBe('Second');
  });

  it('closes modal and clears state', () => {
    service.open(StubComponent, { title: 'To close' });

    service.close();

    expect(service.activeModal()).toBeNull();
  });
});
