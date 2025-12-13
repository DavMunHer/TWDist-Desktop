import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionAdderComponent } from './section-adder.component';

describe('SectionAdderComponent', () => {
  let component: SectionAdderComponent;
  let fixture: ComponentFixture<SectionAdderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionAdderComponent]
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
