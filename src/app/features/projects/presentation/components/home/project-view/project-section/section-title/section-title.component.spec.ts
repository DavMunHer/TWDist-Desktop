import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionTitleComponent } from '@features/projects/presentation/components/home/project-view/project-section/section-title/section-title.component';
import { provideZonelessChangeDetection } from '@angular/core';


describe('SectionTitleComponent', () => {
  let component: SectionTitleComponent;
  let fixture: ComponentFixture<SectionTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionTitleComponent],
      providers: [provideZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectionTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
