import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UpcomingComponent } from '@features/upcoming/presentation/components/upcoming/upcoming.component';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { By } from '@angular/platform-browser';
import { BreadcrumbComponent } from '@shared/ui/breadcrumb/breadcrumb.component';
import { provideZonelessChangeDetection } from '@angular/core';
describe('UpcomingComponent', () => {
  let component: UpcomingComponent;
  let fixture: ComponentFixture<UpcomingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpcomingComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(UpcomingComponent);
    fixture.componentRef.setInput('showIcon', false);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('forwards breadcrumb icon click to parent output', () => {
    const parentEmit = vi.spyOn(component.showIconChange, 'emit');
    const breadcrumbDE = fixture.debugElement.query(By.directive(BreadcrumbComponent));
    const breadcrumb = breadcrumbDE.componentInstance as BreadcrumbComponent;

    breadcrumb.iconClick.emit(true);

    expect(parentEmit).toHaveBeenCalledWith(true);
  });

  it('renders the upcoming title and week range', () => {
    const title = fixture.nativeElement.querySelector('.upcoming-title') as HTMLElement;
    const weekRange = fixture.nativeElement.querySelector('.upcoming-week-range') as HTMLElement;

    expect(title.textContent?.trim()).toBe('Upcoming');
    expect((weekRange.textContent ?? '').trim().length).toBeGreaterThan(0);
  });

  it('disables previous-week navigation in the current week', () => {
    const previousButton = fixture.nativeElement.querySelector('.week-nav-button') as HTMLButtonElement;

    expect(previousButton.disabled).toBe(true);
  });

  it('enables previous-week navigation after moving to next week', () => {
    const nextButton = fixture.nativeElement.querySelectorAll('.week-nav-button')[1] as HTMLButtonElement;
    const previousButton = fixture.nativeElement.querySelectorAll('.week-nav-button')[0] as HTMLButtonElement;

    nextButton.click();
    fixture.detectChanges();

    expect(previousButton.disabled).toBe(false);
  });
});