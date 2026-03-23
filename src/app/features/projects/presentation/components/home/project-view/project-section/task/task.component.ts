import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { TaskViewModel } from '@features/projects/presentation/models/project.view-model';

@Component({
  selector: 'app-task',
  imports: [NgClass],
  templateUrl: './task.component.html',
  styleUrl: './task.component.css'
})
export class TaskComponent {
  public taskInfo = input.required<TaskViewModel>()
  public taskCompleted = output()

  protected sendTaskCompletedChange() {
    this.taskCompleted.emit()
  }
  
}
