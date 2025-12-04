import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { ProjectSectionComponent } from "./components/project-section/project-section.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarComponent, ProjectSectionComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'TWDist-desktop';
}
