import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MenuSectionComponent } from '@shared/ui/sidebar/sidebar-menu-section/menu-section.component';
import { provideZonelessChangeDetection } from '@angular/core';
import { TWDSidebarMenu } from '@shared/ui/sidebar/sidebar-menu';
import { ModalService } from '@shared/ui/modal/modal.service';


describe('MenuSectionComponent', () => {
  let component: MenuSectionComponent;
  let fixture: ComponentFixture<MenuSectionComponent>;
  let modalService: ModalService;

  const menuWithProject: TWDSidebarMenu = {
    title: 'Projects',
    items: [
      { id: 'p-1', name: 'Project One', pendingTasks: 3, icon: 'project', favorite: false },
      { name: 'Today', pendingTasks: 1, icon: 'today' },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuSectionComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuSectionComponent);
    component = fixture.componentInstance;
    modalService = TestBed.inject(ModalService);
    fixture.componentRef.setInput('menuSectionInfo', menuWithProject);
    fixture.componentRef.setInput('showPlusIcon', false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders section title and menu items from input', () => {
    const titleEl: HTMLElement | null = fixture.nativeElement.querySelector('.menu-title');
    const items = fixture.nativeElement.querySelectorAll('li.sidebar-hover');

    expect(titleEl?.textContent).toContain('Projects');
    expect(items.length).toBe(2);
  });

  it('emits menuItemClick when a menu item is clicked', () => {
    const emitSpy = vi.spyOn(component.menuItemClick, 'emit');
    const firstItem: HTMLElement | null = fixture.nativeElement.querySelector('li.sidebar-hover');

    firstItem?.click();

    expect(emitSpy).toHaveBeenCalledWith(menuWithProject.items[0]);
    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  it('opens create-project modal when plus icon is visible and clicked', () => {
    fixture.componentRef.setInput('showPlusIcon', true);
    fixture.detectChanges();
    const openSpy = vi.spyOn(modalService, 'open');
    const icons = fixture.nativeElement.querySelectorAll('.title-section .ico');
    const plusIconEl = icons[0] as Element | undefined;
    plusIconEl?.dispatchEvent(new Event('click'));

    expect(openSpy).toHaveBeenCalledWith('create-project', { title: 'Create project' });
  });

  it('emits favoriteClick with project id from menu action', () => {
    const emitSpy = vi.spyOn(component.favoriteClick, 'emit');
    const trigger = fixture.debugElement.query(By.css('.project-menu-trigger'));
    trigger.triggerEventHandler('click', new MouseEvent('click'));
    fixture.detectChanges();

    const favoriteButton = fixture.debugElement.query(By.css('.project-menu-item'));
    favoriteButton.triggerEventHandler('click', new MouseEvent('click'));

    expect(emitSpy).toHaveBeenCalledWith('p-1');
    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  it('emits deleteClick with project id from menu action', () => {
    const emitSpy = vi.spyOn(component.deleteClick, 'emit');
    const trigger = fixture.debugElement.query(By.css('.project-menu-trigger'));
    trigger.triggerEventHandler('click', new MouseEvent('click'));
    fixture.detectChanges();

    const deleteButton = fixture.debugElement.query(By.css('.project-menu-item--danger'));
    deleteButton.triggerEventHandler('click', new MouseEvent('click'));

    expect(emitSpy).toHaveBeenCalledWith('p-1');
    expect(emitSpy).toHaveBeenCalledTimes(1);
  });
});

