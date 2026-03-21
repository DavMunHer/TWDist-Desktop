import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskComponent } from '@features/projects/presentation/components/home/project-view/project-section/task/task.component';
import { provideZonelessChangeDetection } from '@angular/core';


describe('TaskComponent', () => {
  let component: TaskComponent;
  let fixture: ComponentFixture<TaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskComponent],
      providers: [provideZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
