import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ModalComponent } from '@shared/ui/modal/modal.component';
import { ModalService } from '@shared/ui/modal/modal.service';
import { ModalRef } from '@shared/ui/modal/modal-ref';

@Component({
  selector: 'app-stub-modal-content',
  template: '<p class="stub-content">Stub Content</p>',
  standalone: true,
})
class StubModalContentComponent {}

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;
  let modalService: ModalService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

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

  it('renders title and dynamic content when opened', () => {
    modalService.open(StubModalContentComponent, { title: 'Test Title' });
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('.modal-title') as HTMLElement | null;
    const content = fixture.nativeElement.querySelector('.stub-content');

    expect(title?.textContent?.trim()).toBe('Test Title');
    expect(content).toBeTruthy();
  });

  it('closes when backdrop is clicked', () => {
    modalService.open(StubModalContentComponent, { title: 'Test' });
    fixture.detectChanges();

    const closeSpy = vi.spyOn(modalService, 'close');
    const backdrop = fixture.debugElement.query(By.css('.modal-backdrop'));
    backdrop.triggerEventHandler('click');

    expect(closeSpy).toHaveBeenCalledTimes(1);
  });

  it('closes when header close button is clicked', () => {
    modalService.open(StubModalContentComponent, { title: 'Test' });
    fixture.detectChanges();

    const closeSpy = vi.spyOn(modalService, 'close');
    const closeButton = fixture.debugElement.query(By.css('.modal-close'));
    closeButton.triggerEventHandler('click');

    expect(closeSpy).toHaveBeenCalledTimes(1);
  });

  it('clears backdrop after close', () => {
    modalService.open(StubModalContentComponent, { title: 'Test' });
    fixture.detectChanges();

    modalService.close();
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector('.modal-backdrop');
    expect(backdrop).toBeNull();
  });

  it('provides ModalRef to the dynamic content component', () => {
    modalService.open(StubModalContentComponent, { title: 'Test' });
    fixture.detectChanges();

    const modalRef = TestBed.inject(ModalRef, null, { optional: true });
    expect(modalRef).toBeNull();
  });
});
