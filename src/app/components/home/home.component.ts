import { Component, signal } from '@angular/core';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ProjectViewComponent } from './project-view/project-view.component';

@Component({
  selector: 'app-home',
  imports: [SidebarComponent, ProjectViewComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  protected visibleSidebar = signal<boolean>(true);

  toggleSidebar(newValue: boolean) {
    this.visibleSidebar.set(newValue)
  }
}
