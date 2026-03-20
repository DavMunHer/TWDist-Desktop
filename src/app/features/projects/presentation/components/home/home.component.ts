import { Component, DestroyRef, inject, OnDestroy, OnInit, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, ActivatedRoute } from '@angular/router';
import { filter, startWith } from 'rxjs';
import { SidebarComponent } from '@shared/ui/sidebar/sidebar.component';
import { ProjectViewComponent } from '@features/projects/presentation/components/home/project-view/project-view.component';
import { ProjectStore } from '@features/projects/presentation/store/project.store';
import { TodayComponent } from '@features/today/presentation/components/today/today.component';
import { UpcomingComponent } from '@features/upcoming/presentation/components/upcoming/upcoming.component';
import { ProjectSummaryStore } from '@features/projects/presentation/store/project-summary.store';
import { TWDSidebarMenu, TWDSidebarMenuItem } from '@shared/ui/sidebar/sidebar-menu';

@Component({
  selector: 'app-home',
  imports: [SidebarComponent, ProjectViewComponent, TodayComponent, UpcomingComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly projectStore = inject(ProjectStore);
  private readonly summaryStore = inject(ProjectSummaryStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected visibleSidebar = signal<boolean>(true);
  protected rightPanelView = signal<'project' | 'today' | 'upcoming'>('project');

  protected projects = computed(() =>
    this.projectStore.projects().map((p) => ({
      id: p.id,
      name: p.name,
      favorite: p.favorite,
      pendingTasks: this.summaryStore.pendingCountFor(p.id, p.sectionIds),
    })),
  );

  protected navMenuSectionInfo = computed<TWDSidebarMenu>(() => ({
    title: 'Navigation',
    items: [
      { name: 'Today', pendingTasks: 2, icon: 'today', route: '/projects/today' },
      { name: 'Upcoming', pendingTasks: 0, icon: 'upcoming', route: '/projects/upcoming' },
    ],
  }));

  protected favoriteMenuSectionInfo = computed<TWDSidebarMenu>(() => ({
    title: 'Favorite Projects',
    items: this.projects()
      .filter((p) => p.favorite)
      .map((p) => ({
        id: p.id,
        name: p.name,
        pendingTasks: p.pendingTasks,
        icon: 'project',
        favorite: p.favorite,
      })),
  }));

  protected projectsMenuSectionInfo = computed<TWDSidebarMenu>(() => ({
    title: 'My Projects',
    items: this.projects().map((p) => ({
      id: p.id,
      name: p.name,
      pendingTasks: p.pendingTasks,
      icon: 'project',
      favorite: p.favorite,
    })),
  }));

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

  protected onSidebarMenuItemClick(item: TWDSidebarMenuItem): void {
    if (item.route) {
      this.router.navigateByUrl(item.route);
      return;
    }

    if (item.id) {
      this.router.navigate(['/projects', item.id]);
    }
  }

  protected onSidebarFavoriteClick(projectId: string): void {
    this.projectStore.toggleProjectFavorite(projectId);
  }

  protected onSidebarDeleteClick(projectId: string): void {
    this.projectStore.deleteProject(projectId);
  }

  ngOnDestroy(): void {
    this.projectStore.disconnectFromEvents();
  }
}
