import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, convertToParamMap } from '@angular/router';
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HomeComponent } from '@features/projects/presentation/components/home/home.component';
import { ProjectStore } from '@features/projects/presentation/store/project.store';
import { ProjectSummaryStore } from '@features/projects/presentation/store/project-summary.store';
import { BreadcrumbComponent } from '@shared/ui/breadcrumb/breadcrumb.component';
import { ProjectViewComponent } from '@features/projects/presentation/components/home/project-view/project-view.component';
import { TodayComponent } from '@features/today/presentation/components/today/today.component';
import { UpcomingComponent } from '@features/upcoming/presentation/components/upcoming/upcoming.component';
import { TWDSidebarMenuItem } from '@shared/ui/sidebar/sidebar-menu';
import { ProjectViewModel } from '@features/projects/presentation/models/project.view-model';
import { ProjectOutput } from '@features/projects/application/dtos/project-output';
import { ModalService } from '@shared/ui/modal/modal.service';
import { ConfirmComponent } from '@shared/ui/modal/confirm/confirm.component';
import { AuthStore } from '@features/auth/presentation/store/auth.store';
import { User } from '@features/auth/domain/entities/user.entity';

const mockAuthStore = { user: signal<User | null>(new User('1', 'test@example.com', 'TestUser')) };

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let component: HomeComponent;
  let routerEvents$: Subject<unknown>;

  const routerMock = {
    get url() {
      return routerUrl;
    },
    events: null as unknown as ReturnType<Subject<unknown>['asObservable']>,
    navigateByUrl: vi.fn(),
    navigate: vi.fn(),
  };

  let routerUrl = '/projects/upcoming';

  const activatedRouteMock = {
    snapshot: {
      paramMap: convertToParamMap({ id: 'p1' }),
    },
  };

  const projectStoreMock = {
    projects: signal<ProjectOutput[]>([]),
    selectedProjectId: signal<string | null>(null),
    /** Required by embedded {@link ProjectViewComponent} template */
    projectView: signal<ProjectViewModel | null>(null).asReadonly(),
    loadAllProjects: vi.fn(),
    loadProject: vi.fn(),
    toggleProjectFavorite: vi.fn(),
    deleteProject: vi.fn(),
    disconnectFromEvents: vi.fn(),
  };

  const projectSummaryStoreMock = {
    pendingCountFor: vi.fn().mockReturnValue(0),
  };

  const modalServiceMock = {
    open: vi.fn(),
  };

  function flushRoute(url: string): void {
    routerUrl = url;
    routerEvents$.next(new NavigationEnd(1, url, url));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    vi.clearAllMocks();
    routerUrl = '/projects/upcoming';
    routerEvents$ = new Subject<unknown>();
    routerMock.events = routerEvents$.asObservable();
    projectStoreMock.projects.set([]);
    projectStoreMock.selectedProjectId.set(null);
    activatedRouteMock.snapshot.paramMap = convertToParamMap({ id: 'p1' });
    modalServiceMock.open.mockReset();

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: ProjectStore, useValue: projectStoreMock },
        { provide: ProjectSummaryStore, useValue: projectSummaryStoreMock },
        { provide: ModalService, useValue: modalServiceMock },
        { provide: AuthStore, useValue: mockAuthStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    flushRoute(routerUrl);
  });

  afterEach(() => {
    routerEvents$.complete();
  });

  it('calls loadAllProjects on init', () => {
    expect(projectStoreMock.loadAllProjects).toHaveBeenCalled();
  });

  it('calls disconnectFromEvents when destroyed', () => {
    fixture.destroy();
    expect(projectStoreMock.disconnectFromEvents).toHaveBeenCalled();
  });

  describe('right panel from route', () => {
    it('renders Upcoming when URL is /projects/upcoming', () => {
      expect(fixture.debugElement.query(By.directive(UpcomingComponent))).toBeTruthy();
      expect(fixture.debugElement.query(By.directive(TodayComponent))).toBeFalsy();
      expect(fixture.debugElement.query(By.directive(ProjectViewComponent))).toBeFalsy();
    });

    it('renders Today when URL is /projects/today', () => {
      flushRoute('/projects/today');
      expect(fixture.debugElement.query(By.directive(TodayComponent))).toBeTruthy();
      expect(fixture.debugElement.query(By.directive(UpcomingComponent))).toBeFalsy();
    });

    it('renders ProjectView when URL is a project route', () => {
      flushRoute('/projects/p99');
      expect(fixture.debugElement.query(By.directive(ProjectViewComponent))).toBeTruthy();
      expect(fixture.debugElement.query(By.directive(UpcomingComponent))).toBeFalsy();
    });

    it('calls loadProject when route id differs from selectedProjectId', () => {
      activatedRouteMock.snapshot.paramMap = convertToParamMap({ id: 'p2' });
      projectStoreMock.selectedProjectId.set(null);
      flushRoute('/projects/p2');
      expect(projectStoreMock.loadProject).toHaveBeenCalledWith('p2');
    });

    it('does not call loadProject when route id matches selectedProjectId and sectionIds is non-empty', () => {
      activatedRouteMock.snapshot.paramMap = convertToParamMap({ id: 'p1' });
      projectStoreMock.selectedProjectId.set('p1');
      projectStoreMock.projects.set([{ id: 'p1', name: 'P', favorite: false, sectionIds: ['s1'] }]);
      vi.clearAllMocks();
      flushRoute('/projects/p1');
      expect(projectStoreMock.loadProject).not.toHaveBeenCalled();
    });
  });

  describe('sidebar menu actions', () => {
    it('navigates by URL when menu item has route', () => {
      const item: TWDSidebarMenuItem = { name: 'Today', pendingTasks: 0, route: '/projects/today' };
      component['onSidebarMenuItemClick'](item);
      expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/projects/today');
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it('navigates to project when menu item has id only', () => {
      const item: TWDSidebarMenuItem = { name: 'X', pendingTasks: 0, id: 'proj-1', icon: 'project' };
      component['onSidebarMenuItemClick'](item);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/projects', 'proj-1']);
    });

    it('delegates favorite toggle to project store', () => {
      component['onSidebarFavoriteClick']('pid');
      expect(projectStoreMock.toggleProjectFavorite).toHaveBeenCalledWith('pid');
    });

    it('opens delete confirmation modal for a project', () => {
      projectStoreMock.projects.set([{ id: 'pid', name: 'Inbox', favorite: false, sectionIds: [] }]);

      component['onSidebarDeleteClick']('pid');

      expect(modalServiceMock.open).toHaveBeenCalledWith(
        ConfirmComponent,
        expect.objectContaining({
          title: 'Delete Project',
        }),
      );
      expect(projectStoreMock.deleteProject).not.toHaveBeenCalled();
    });

    it('delegates delete to project store only after confirmation', () => {
      projectStoreMock.projects.set([{ id: 'pid', name: 'Inbox', favorite: false, sectionIds: [] }]);

      component['onSidebarDeleteClick']('pid');

      const [, config] = modalServiceMock.open.mock.calls[0] as [
        typeof ConfirmComponent,
        { onClose?: (result?: unknown) => void }
      ];

      config.onClose?.(true);

      expect(projectStoreMock.deleteProject).toHaveBeenCalledWith('pid');
    });

    it('toggleSidebar updates visibleSidebar signal', () => {
      component['toggleSidebar'](false);
      expect(component['visibleSidebar']()).toBe(false);
      component['toggleSidebar'](true);
      expect(component['visibleSidebar']()).toBe(true);
    });
  });

  describe('breadcrumb → sidebar visibility (Upcoming)', () => {
    beforeEach(() => {
      flushRoute('/projects/upcoming');
    });

    it('propagates breadcrumb icon click to open sidebar when hidden', () => {
      component['visibleSidebar'].set(false);
      fixture.detectChanges();

      const breadcrumbDE = fixture.debugElement.query(By.directive(BreadcrumbComponent));
      const breadcrumb = breadcrumbDE.componentInstance as BreadcrumbComponent;
      breadcrumb.iconClick.emit(true);
      fixture.detectChanges();

      expect(component['visibleSidebar']()).toBe(true);
    });
  });
});
