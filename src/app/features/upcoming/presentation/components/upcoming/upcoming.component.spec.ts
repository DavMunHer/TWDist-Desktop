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
      providers: [provideZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpcomingComponent);
    fixture.componentRef.setInput('showIcon', false); // required input
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


describe('Breadcrumb integration inside the UpcomingComponent', () => {
  let fixture: ComponentFixture<UpcomingComponent>;
  let component: UpcomingComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpcomingComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    fixture = TestBed.createComponent(UpcomingComponent);
    fixture.componentRef.setInput('showIcon', false); // required input on parent
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('forwards breadcrumb click to parent output', () => {
    const parentEmit = vi.spyOn(component.showIconChange, 'emit');
    const breadcrumbDE = fixture.debugElement.query(By.directive(BreadcrumbComponent));
    const breadcrumb = breadcrumbDE.componentInstance as BreadcrumbComponent;

    breadcrumb.iconClick.emit(true); // simulate child event
    expect(parentEmit).toHaveBeenCalledWith(true);
  });
});