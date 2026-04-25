import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ModalService } from '@shared/ui/modal/modal.service';
import { ConfigurationComponent } from '@shared/ui/modal/configuration/configuration.component';
import { ProfileComponent } from '@shared/ui/modal/profile/profile.component';
import { TWDSidebarMenu } from '@shared/ui/sidebar/sidebar-menu';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SidebarComponent } from '@shared/ui/sidebar/sidebar.component';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { AuthStore } from '@features/auth/presentation/store/auth.store';
import { User } from '@features/auth/domain/entities/user.entity';

const mockUser = new User('1', 'test@example.com', 'TestUser');
const mockAuthStore = { user: signal<User | null>(mockUser) };


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
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthStore, useValue: mockAuthStore },
      ],
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

  it('toggles dropdown open class when profile trigger is clicked', () => {
    const triggerButton: HTMLButtonElement | null = fixture.nativeElement.querySelector('.profile-dropdown-trigger');
    const dropdown: HTMLElement | null = fixture.nativeElement.querySelector('.profile-dropdown');

    triggerButton?.click();
    fixture.detectChanges();
    expect(dropdown?.classList.contains('open')).toBe(true);

    triggerButton?.click();
    fixture.detectChanges();
    expect(dropdown?.classList.contains('open')).toBe(false);
  });

  it('closes dropdown when clicking outside', () => {
    const triggerButton: HTMLButtonElement | null = fixture.nativeElement.querySelector('.profile-dropdown-trigger');
    const dropdown: HTMLElement | null = fixture.nativeElement.querySelector('.profile-dropdown');

    triggerButton?.click();
    fixture.detectChanges();
    expect(dropdown?.classList.contains('open')).toBe(true);

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(dropdown?.classList.contains('open')).toBe(false);
  });

  it('opens profile modal when profile option is clicked', () => {
    const openSpy = vi.spyOn(modalService, 'open');
    const profileOptionDE = fixture.debugElement.query(By.css('.dropdown-content .dropdown-action'));
    const triggerButton: HTMLButtonElement | null = fixture.nativeElement.querySelector('.profile-dropdown-trigger');
    const dropdown: HTMLElement | null = fixture.nativeElement.querySelector('.profile-dropdown');

    triggerButton?.click();
    fixture.detectChanges();
    expect(dropdown?.classList.contains('open')).toBe(true);

    profileOptionDE.triggerEventHandler('click');
    fixture.detectChanges();

    expect(openSpy).toHaveBeenCalledWith(ProfileComponent, { title: 'Profile' });
    expect(dropdown?.classList.contains('open')).toBe(false);
  });

  it('opens configuration modal and closes dropdown when configuration option is clicked', () => {
    const openSpy = vi.spyOn(modalService, 'open');
    const optionsDE = fixture.debugElement.queryAll(By.css('.dropdown-content .dropdown-action'));
    const configurationOptionDE = optionsDE[1];
    const triggerButton: HTMLButtonElement | null = fixture.nativeElement.querySelector('.profile-dropdown-trigger');
    const dropdown: HTMLElement | null = fixture.nativeElement.querySelector('.profile-dropdown');

    triggerButton?.click();
    fixture.detectChanges();
    expect(dropdown?.classList.contains('open')).toBe(true);

    configurationOptionDE.triggerEventHandler('click');
    fixture.detectChanges();

    expect(openSpy).toHaveBeenCalledWith(ConfigurationComponent, { title: 'Configuration' });
    expect(dropdown?.classList.contains('open')).toBe(false);
  });

  it('emits createProjectClick when plus icon in projects section is clicked', () => {
    const emitSpy = vi.spyOn(component.createProjectClick, 'emit');

    component.onCreateProjectClick();

    expect(emitSpy).toHaveBeenCalledTimes(1);
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
