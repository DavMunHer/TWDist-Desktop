import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { TWDTask } from '../../../../models/task';

@Component({
  selector: 'task',
  imports: [NgClass],
  templateUrl: './task.component.html',
  styleUrl: './task.component.css'
})
export class TaskComponent {
  public taskInfo = input.required<TWDTask>()
  public onTaskCompleted = output()

  protected sendTaskCompletedChange() {
    this.onTaskCompleted.emit()
  }
  
}
