import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionAdderComponent } from '@features/projects/presentation/components/home/project-view/section-adder/section-adder.component';
import { provideZonelessChangeDetection } from '@angular/core';


describe('SectionAdderComponent', () => {
  let component: SectionAdderComponent;
  let fixture: ComponentFixture<SectionAdderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionAdderComponent],
      providers: [provideZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectionAdderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
