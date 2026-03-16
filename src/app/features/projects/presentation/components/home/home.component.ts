import { Component, DestroyRef, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, ActivatedRoute } from '@angular/router';
import { filter, startWith } from 'rxjs';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ProjectViewComponent } from './project-view/project-view.component';
import { ProjectStore } from '../../store/project.store';
import { TodayComponent } from '@features/today/presentation/components/today/today.component';
import { UpcomingComponent } from '@features/upcoming/presentation/components/upcoming/upcoming.component';

@Component({
  selector: 'app-home',
  imports: [SidebarComponent, ProjectViewComponent, TodayComponent, UpcomingComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly projectStore = inject(ProjectStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected visibleSidebar = signal<boolean>(true);
  protected rightPanelView = signal<'project' | 'today' | 'upcoming'>('project');

  ngOnInit(): void {
    this.projectStore.loadAllProjects();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        startWith(null),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.syncViewFromRoute());
  }

  private syncViewFromRoute(): void {
    const url = this.router.url;

    if (url.startsWith('/projects/today')) {
      this.rightPanelView.set('today');
      return;
    }

    if (url.startsWith('/projects/upcoming')) {
      this.rightPanelView.set('upcoming');
      return;
    }

    this.rightPanelView.set('project');
    const projectId = this.route.snapshot.paramMap.get('id');

    if (projectId && this.projectStore.selectedProjectId() !== projectId) {
      this.projectStore.loadProject(projectId);
    }
  }

  toggleSidebar(newValue: boolean) {
    this.visibleSidebar.set(newValue)
  }

  ngOnDestroy(): void {
    this.projectStore.disconnectFromEvents();
  }
}
