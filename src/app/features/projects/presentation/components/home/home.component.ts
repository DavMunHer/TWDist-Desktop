import { Component, inject, OnDestroy, signal } from '@angular/core';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ProjectViewComponent } from './project-view/project-view.component';
import { ProjectStore } from '../../store/project.store';

@Component({
  selector: 'app-home',
  imports: [SidebarComponent, ProjectViewComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnDestroy {
  private readonly projectStore = inject(ProjectStore);
  protected visibleSidebar = signal<boolean>(true);

  toggleSidebar(newValue: boolean) {
    this.visibleSidebar.set(newValue)
  }

  ngOnDestroy(): void {
    this.projectStore.disconnectFromEvents();
  }
}
