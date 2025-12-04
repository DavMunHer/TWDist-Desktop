import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-project-view',
  imports: [],
  templateUrl: './project-view.component.html',
  styleUrl: './project-view.component.css'
})
export class ProjectViewComponent {
  protected projectInfo = signal("") //FIXME: change later
}
