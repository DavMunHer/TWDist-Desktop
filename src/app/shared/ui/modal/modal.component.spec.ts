import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalComponent } from './modal.component';
import { ModalService } from './modal.service';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;
  let modalService: ModalService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    modalService = TestBed.inject(ModalService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('does not render modal while closed', () => {
    const backdrop = fixture.nativeElement.querySelector('.modal-backdrop');
    expect(backdrop).toBeNull();
  });

  it('renders title and configuration content when opened', () => {
    modalService.open('configuration', { title: 'Configuration' });
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('.modal-title') as HTMLElement | null;
    const configurationContent = fixture.nativeElement.querySelector('configuration-modal');

    expect(title?.textContent).toContain('Configuration');
    expect(configurationContent).toBeTruthy();
  });

  it('closes when backdrop is clicked', () => {
    modalService.open('configuration', { title: 'Configuration' });
    fixture.detectChanges();

    const closeSpy = vi.spyOn(modalService, 'close');
    const backdrop = fixture.debugElement.query(By.css('.modal-backdrop'));
    backdrop.triggerEventHandler('click');

    expect(closeSpy).toHaveBeenCalledTimes(1);
  });

  it('closes when header close button is clicked', () => {
    modalService.open('profile', { title: 'Profile' });
    fixture.detectChanges();

    const closeSpy = vi.spyOn(modalService, 'close');
    const closeButton = fixture.debugElement.query(By.css('.modal-close'));
    closeButton.triggerEventHandler('click');

    expect(closeSpy).toHaveBeenCalledTimes(1);
  });
});
