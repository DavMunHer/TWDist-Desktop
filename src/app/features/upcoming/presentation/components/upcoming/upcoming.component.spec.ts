import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { UpcomingComponent } from '@features/upcoming/presentation/components/upcoming/upcoming.component';
import { UpcomingStore } from '@features/upcoming/presentation/store/upcoming.store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { By } from '@angular/platform-browser';
import { BreadcrumbComponent } from '@shared/ui/breadcrumb/breadcrumb.component';

const upcomingStoreMock = {
  upcomingGroups: signal([]),
  weekRange: signal({
    start: new Date('2026-05-04'),
    end: new Date('2026-05-10'),
    label: 'May 4 - May 10, 2026',
  }),
  isCurrentWeek: signal(true),
  scrollToTodaySignal: signal(0),
  loading: signal(false),
  error: signal<string | null>(null),
  ensureUpcomingTasksLoaded: vi.fn(),
  loadUpcomingTasks: vi.fn(),
  goToPreviousWeek: vi.fn(),
  goToNextWeek: vi.fn(),
  goToCurrentWeek: vi.fn(),
  toggleTaskCompletion: vi.fn(),
  renameTask: vi.fn(),
  deleteTask: vi.fn(),
  editTask: vi.fn(),
};

describe('UpcomingComponent', () => {
  let component: UpcomingComponent;
  let fixture: ComponentFixture<UpcomingComponent>;

  beforeEach(async () => {
    upcomingStoreMock.ensureUpcomingTasksLoaded.mockReset();
    upcomingStoreMock.loadUpcomingTasks.mockReset();
    upcomingStoreMock.isCurrentWeek.set(true);
    upcomingStoreMock.loading.set(false);
    upcomingStoreMock.error.set(null);

    await TestBed.configureTestingModule({
      imports: [UpcomingComponent],
      providers: [provideZonelessChangeDetection()],
    })
      .overrideComponent(UpcomingComponent, {
        set: {
          providers: [{ provide: UpcomingStore, useValue: upcomingStoreMock }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(UpcomingComponent);
    fixture.componentRef.setInput('showIcon', false);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('ensures upcoming tasks are loaded on init', () => {
    expect(upcomingStoreMock.ensureUpcomingTasksLoaded).toHaveBeenCalled();
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
    upcomingStoreMock.isCurrentWeek.set(false);
    fixture.detectChanges();

    const previousButton = fixture.nativeElement.querySelectorAll('.week-nav-button')[0] as HTMLButtonElement;
    expect(previousButton.disabled).toBe(false);
  });

  it('retries loading on error state', () => {
    upcomingStoreMock.error.set('Failed to load upcoming tasks.');
    fixture.detectChanges();

    const retryButton = fixture.nativeElement.querySelector('.retry-button') as HTMLButtonElement;
    retryButton.click();

    expect(upcomingStoreMock.loadUpcomingTasks).toHaveBeenCalledOnce();
  });
});