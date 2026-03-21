import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuSectionComponent } from '@shared/ui/sidebar/sidebar-menu-section/menu-section.component';
import { provideZonelessChangeDetection } from '@angular/core';


describe('MenuSectionComponent', () => {
  let component: MenuSectionComponent;
  let fixture: ComponentFixture<MenuSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuSectionComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

