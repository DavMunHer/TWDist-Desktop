import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectViewComponent } from '@features/projects/presentation/components/home/project-view/project-view.component';
import { provideZonelessChangeDetection } from '@angular/core';


describe('ProjectViewComponent', () => {
  let component: ProjectViewComponent;
  let fixture: ComponentFixture<ProjectViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectViewComponent],
      providers: [provideZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
