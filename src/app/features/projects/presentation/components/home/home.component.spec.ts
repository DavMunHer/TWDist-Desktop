import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, convertToParamMap } from '@angular/router';
import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HomeComponent } from '@features/projects/presentation/components/home/home.component';
import { ProjectStore } from '@features/projects/presentation/store/project.store';
import { ProjectSummaryStore } from '@features/projects/presentation/store/project-summary.store';
import { BreadcrumbComponent } from '@shared/ui/breadcrumb/breadcrumb.component';
import { UpcomingComponent } from '@features/upcoming/presentation/components/upcoming/upcoming.component';
import { provideZonelessChangeDetection } from '@angular/core';


describe('HomeComponent breadcrumb integration', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let component: HomeComponent;

  const routerEvents$ = new Subject<unknown>();

  const routerMock = {
    url: '/projects/upcoming',
    events: routerEvents$.asObservable(),
    navigateByUrl: vi.fn(),
    navigate: vi.fn(),
  };

  const activatedRouteMock = {
    snapshot: {
      paramMap: convertToParamMap({ id: 'p1' }),
    },
  };

  const projectStoreMock = {
    projects: signal([]),
    selectedProjectId: signal<string | null>(null),
    loadAllProjects: vi.fn(),
    loadProject: vi.fn(),
    toggleProjectFavorite: vi.fn(),
    deleteProject: vi.fn(),
    disconnectFromEvents: vi.fn(),
  };

  const projectSummaryStoreMock = {
    pendingCountFor: vi.fn().mockReturnValue(0),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: ProjectStore, useValue: projectStoreMock },
        { provide: ProjectSummaryStore, useValue: projectSummaryStoreMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    routerEvents$.next(new NavigationEnd(1, '/projects/upcoming', '/projects/upcoming'));
    fixture.detectChanges();
  });

  it('renders Upcoming view from route', () => {
    const upcoming = fixture.debugElement.query(By.directive(UpcomingComponent));
    expect(upcoming).toBeTruthy();
  });

  it('propagates breadcrumb click up to Home and opens sidebar', () => {
    (component as any).visibleSidebar.set(false);
    fixture.detectChanges();

    const breadcrumbDE = fixture.debugElement.query(By.directive(BreadcrumbComponent));
    const breadcrumb = breadcrumbDE.componentInstance as BreadcrumbComponent;

    breadcrumb.onIconClick.emit(true);
    fixture.detectChanges();

    expect((component as any).visibleSidebar()).toBe(true);
  });
});