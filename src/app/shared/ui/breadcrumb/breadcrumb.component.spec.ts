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
    const emitSpy = vi.spyOn(component.iconClick, 'emit');

    const iconEl: HTMLElement | null =
      fixture.nativeElement.querySelector('.breadcrumb-toggle-ico');
    iconEl?.click();

    expect(emitSpy).toHaveBeenCalledWith(true);
    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  it('renders filter icon before the options icon in the right section', () => {
    const rightIcons = fixture.nativeElement.querySelectorAll('.breadcrumb-right-section .breadcrumb-ico');
    const filterButton: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('.breadcrumb-filter-button');

    expect(rightIcons.length).toBe(2);
    expect(filterButton?.getAttribute('aria-label')).toBe('Filter items');
    expect(rightIcons[1].getAttribute('aria-label')).toBeNull();
  });

  it('shows task filter options when clicking the filter icon', () => {
    const filterButton: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('.breadcrumb-filter-button');
    const filterTrigger: HTMLElement | null =
      fixture.nativeElement.querySelector('.breadcrumb-filter-trigger');

    filterButton?.click();
    fixture.detectChanges();

    const panel: HTMLElement | null = fixture.nativeElement.querySelector('#task-filter-panel');
    const optionLabels = Array.from(
      fixture.nativeElement.querySelectorAll('.task-filter-option span') as NodeListOf<HTMLElement>
    ).map(el => el.textContent?.trim());

    expect(panel).not.toBeNull();
    expect(panel?.tagName).toBe('DIALOG');
    expect(filterTrigger?.classList.contains('active')).toBe(true);
    expect(optionLabels).toEqual([
      'All tasks',
      'Uncompleted tasks',
      'Completed tasks',
    ]);
  });

  it('hides task filter options when clicking the filter icon twice', () => {
    const filterButton: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('.breadcrumb-filter-button');
    const filterTrigger: HTMLElement | null =
      fixture.nativeElement.querySelector('.breadcrumb-filter-trigger');

    filterButton?.click();
    fixture.detectChanges();
    filterButton?.click();
    fixture.detectChanges();

    const panel: HTMLElement | null = fixture.nativeElement.querySelector('#task-filter-panel');

    expect(panel).toBeNull();
    expect(filterTrigger?.classList.contains('active')).toBe(false);
  });

  it('closes task filter options when clicking outside the menu', () => {
    const filterButton: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('.breadcrumb-filter-button');

    filterButton?.click();
    fixture.detectChanges();

    document.body.click();
    fixture.detectChanges();

    const panel: HTMLElement | null = fixture.nativeElement.querySelector('#task-filter-panel');

    expect(panel).toBeNull();
  });

  it('emits selected task filter when choosing an option', () => {
    const emitSpy = vi.spyOn(component.taskFilterChange, 'emit');
    const filterButton: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('.breadcrumb-filter-button');

    filterButton?.click();
    fixture.detectChanges();

    const filterOptions = fixture.nativeElement.querySelectorAll('input[name="task-filter"]') as NodeListOf<HTMLInputElement>;
    filterOptions[1]?.dispatchEvent(new Event('change'));

    expect(emitSpy).toHaveBeenCalledWith('uncompleted');
  });
});