import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BreadcrumbComponent } from '@shared/ui/breadcrumb/breadcrumb.component';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';


describe('BreadcrumbComponent', () => {
  let fixture: ComponentFixture<BreadcrumbComponent>;
  let component: BreadcrumbComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BreadcrumbComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(BreadcrumbComponent);

    fixture.componentRef.setInput('showIcon', false);
    fixture.componentRef.setInput('route', 'Dashboard');

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders the route text from input', () => {
    const routeEl: HTMLElement | null =
      fixture.nativeElement.querySelector('.breadcrumb-route');

    expect(routeEl?.textContent).toContain('Dashboard');
  });

  it('adds invisible class when showIcon is true', () => {
    fixture.componentRef.setInput('showIcon', true);
    fixture.detectChanges();

    const iconEl: HTMLElement | null =
      fixture.nativeElement.querySelector('.breadcrumb-toggle-ico');

    expect(iconEl?.classList.contains('invisible')).toBe(true);
  });

  it('emits true when the left icon is clicked', () => {
    const emitSpy = vi.spyOn(component.onIconClick, 'emit');

    const iconEl: HTMLElement | null =
      fixture.nativeElement.querySelector('.breadcrumb-toggle-ico');
    iconEl?.click();

    expect(emitSpy).toHaveBeenCalledWith(true);
    expect(emitSpy).toHaveBeenCalledTimes(1);
  });
});