import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ModalService } from '@shared/ui/modal/modal.service';
import { TWDSidebarMenu } from '@shared/ui/sidebar/sidebar-menu';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SidebarComponent } from '@shared/ui/sidebar/sidebar.component';
import { provideZonelessChangeDetection } from '@angular/core';


describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let modalService: ModalService;

  const navMenu: TWDSidebarMenu = {
    title: 'Navigation',
    items: [{ name: 'Today', pendingTasks: 1, route: '/today' }],
  };

  const favoriteMenuWithItems: TWDSidebarMenu = {
    title: 'Favorite',
    items: [{ id: 'fav-1', name: 'Project A', pendingTasks: 2, favorite: true }],
  };

  const favoriteMenuEmpty: TWDSidebarMenu = {
    title: 'Favorite',
    items: [],
  };

  const projectsMenu: TWDSidebarMenu = {
    title: 'Projects',
    items: [{ id: 'p-1', name: 'Project X', pendingTasks: 3 }],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    modalService = TestBed.inject(ModalService);

    fixture.componentRef.setInput('sidebarVisibleInput', true);
    fixture.componentRef.setInput('navMenuSectionInfo', navMenu);
    fixture.componentRef.setInput('favoriteMenuSectionInfo', favoriteMenuWithItems);
    fixture.componentRef.setInput('projectsMenuSectionInfo', projectsMenu);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('adds invisible class when sidebarVisibleInput is false', () => {
    fixture.componentRef.setInput('sidebarVisibleInput', false);
    fixture.detectChanges();

    const sidebarEl: HTMLElement | null = fixture.nativeElement.querySelector('.sidebar');
    expect(sidebarEl?.classList.contains('invisible')).toBe(true);
  });

  it('emits false when toggle view icon is clicked', () => {
    const emitSpy = vi.spyOn(component.sidebarClose, 'emit');
    const toggleIconDE = fixture.debugElement.query(By.css('.icon-view'));

    toggleIconDE.triggerEventHandler('click');

    expect(emitSpy).toHaveBeenCalledWith(false);
    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  // TODO: Enable this test when profile dropdown toggle behavior is fully implemented.
  it.todo('toggles dropdown open class when profile area is clicked');

  it('opens profile modal when profile option is clicked', () => {
    const openSpy = vi.spyOn(modalService, 'open');
    const profileOptionDE = fixture.debugElement.query(By.css('.dropdown-content div'));

    profileOptionDE.triggerEventHandler('click');

    expect(openSpy).toHaveBeenCalledWith('profile', { title: 'Profile' });
  });

  it('renders favorite section only when it has items', () => {
    let sections = fixture.nativeElement.querySelectorAll('app-sidebar-menu-section');
    expect(sections.length).toBe(3);

    fixture.componentRef.setInput('favoriteMenuSectionInfo', favoriteMenuEmpty);
    fixture.detectChanges();

    sections = fixture.nativeElement.querySelectorAll('app-sidebar-menu-section');
    expect(sections.length).toBe(2);
  });
});
