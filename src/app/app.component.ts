import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { ProjectViewComponent } from "./components/project-view/project-view.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarComponent, ProjectViewComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'TWDist-desktop';
}
