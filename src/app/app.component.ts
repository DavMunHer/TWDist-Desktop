import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from "./components/home/sidebar/sidebar.component";
import { ProjectViewComponent } from "./components/home/project-view/project-view.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'TWDist-desktop';

}
