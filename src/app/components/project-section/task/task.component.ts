import { Component, input, output } from '@angular/core';
import { TWDTask } from '../../../types/task';
import { NgClass } from '@angular/common';

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
