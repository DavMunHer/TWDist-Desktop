import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { SectionTitleComponent } from '@features/projects/presentation/components/home/project-view/project-section/section-title/section-title.component';
import { provideZonelessChangeDetection } from '@angular/core';

describe('SectionTitleComponent', () => {
  let component: SectionTitleComponent;
  let fixture: ComponentFixture<SectionTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionTitleComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionTitleComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'Section name');
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('renders title text', () => {
    const el: HTMLElement = fixture.nativeElement.querySelector('.title');
    expect(el?.textContent?.trim()).toContain('Section name');
  });

  it('applies bold-title class when titleStyle is bold', () => {
    fixture.componentRef.setInput('titleStyle', 'bold');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement.querySelector('.title');
    expect(el?.classList.contains('bold-title')).toBe(true);
  });

  it('does not apply bold-title when titleStyle is normal', () => {
    fixture.componentRef.setInput('titleStyle', 'normal');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement.querySelector('.title');
    expect(el?.classList.contains('bold-title')).toBe(false);
  });
});
