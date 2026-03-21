import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodayComponent } from '@features/today/presentation/components/today/today.component';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { By } from '@angular/platform-browser';
import { BreadcrumbComponent } from '@shared/ui/breadcrumb/breadcrumb.component';
import { provideZonelessChangeDetection } from '@angular/core';


describe('TodayComponent', () => {
  let component: TodayComponent;
  let fixture: ComponentFixture<TodayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodayComponent],
      providers: [provideZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TodayComponent);
    fixture.componentRef.setInput('showIcon', false); // required input 
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // TODO: Add actual tests for the Today specific behavior, not just the breadcrumb integration 
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


describe('Breadcrumb integration inside the TodayComponent', () => {
  let fixture: ComponentFixture<TodayComponent>;
  let component: TodayComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TodayComponent] }).compileComponents();
    fixture = TestBed.createComponent(TodayComponent);
    fixture.componentRef.setInput('showIcon', false); // required input on parent
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('forwards breadcrumb click to parent output', () => {
    const parentEmit = vi.spyOn(component.showIconChange, 'emit');
    const breadcrumbDE = fixture.debugElement.query(By.directive(BreadcrumbComponent));
    const breadcrumb = breadcrumbDE.componentInstance as BreadcrumbComponent;

    breadcrumb.onIconClick.emit(true); // simulate child event
    expect(parentEmit).toHaveBeenCalledWith(true);
  });
});