import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { TaskView } from '../../../../../models/model-views/view.types';

@Component({
  selector: 'task',
  imports: [NgClass],
  templateUrl: './task.component.html',
  styleUrl: './task.component.css'
})
export class TaskComponent {
  public taskInfo = input.required<TaskView>()
  public onTaskCompleted = output()

  protected sendTaskCompletedChange() {
    this.onTaskCompleted.emit()
  }
  
}
