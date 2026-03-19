import { TestBed } from '@angular/core/testing';
import { ModalService } from './modal.service';

describe('ModalService', () => {
  let service: ModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('opens a modal with type and data', () => {
    service.open('configuration', { title: 'Configuration' });

    expect(service.modalType()).toBe('configuration');
    expect(service.modalData()).toEqual({ title: 'Configuration' });
  });

  it('opens a modal with null data when not provided', () => {
    service.open('profile');

    expect(service.modalType()).toBe('profile');
    expect(service.modalData()).toBeNull();
  });

  it('closes modal and clears state', () => {
    service.open('create-project', { title: 'Create Project' });

    service.close();

    expect(service.modalType()).toBeNull();
    expect(service.modalData()).toBeNull();
  });
});
