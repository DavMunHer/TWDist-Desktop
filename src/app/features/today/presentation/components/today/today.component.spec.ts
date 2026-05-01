import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { TodayComponent } from '@features/today/presentation/components/today/today.component';
import { TodayStore } from '@features/today/presentation/store/today.store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { By } from '@angular/platform-browser';
import { BreadcrumbComponent } from '@shared/ui/breadcrumb/breadcrumb.component';
import { provideZonelessChangeDetection } from '@angular/core';

const todayStoreMock = {
  todayGroups: signal([]),
  toggleTaskCompletion: vi.fn(),
  renameTask: vi.fn(),
  deleteTask: vi.fn(),
  editTask: vi.fn(),
};

describe('TodayComponent', () => {
  let component: TodayComponent;
  let fixture: ComponentFixture<TodayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodayComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: TodayStore, useValue: todayStoreMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TodayComponent);
    fixture.componentRef.setInput('showIcon', false);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders today title', () => {
    const title: HTMLElement = fixture.nativeElement.querySelector('.today-title');
    expect(title?.textContent?.trim()).toBe('Today');
  });

  it('shows empty state when no groups are present', () => {
    const empty: HTMLElement = fixture.nativeElement.querySelector('.today-empty-state');
    expect(empty).toBeTruthy();
  });
});

describe('Breadcrumb integration inside the TodayComponent', () => {
  let fixture: ComponentFixture<TodayComponent>;
  let component: TodayComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodayComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: TodayStore, useValue: todayStoreMock },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(TodayComponent);
    fixture.componentRef.setInput('showIcon', false);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('forwards breadcrumb click to parent output', () => {
    const parentEmit = vi.spyOn(component.showIconChange, 'emit');
    const breadcrumbDE = fixture.debugElement.query(By.directive(BreadcrumbComponent));
    const breadcrumb = breadcrumbDE.componentInstance as BreadcrumbComponent;

    breadcrumb.iconClick.emit(true);
    expect(parentEmit).toHaveBeenCalledWith(true);
  });
});
