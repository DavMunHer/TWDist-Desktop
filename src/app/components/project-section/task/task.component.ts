import { Component, input } from '@angular/core';
import { TWDTask } from '../../../types/task';

@Component({
  selector: 'task',
  imports: [],
  templateUrl: './task.component.html',
  styleUrl: './task.component.css'
})
export class TaskComponent {
  public taskInfo = input.required<TWDTask>()
}
