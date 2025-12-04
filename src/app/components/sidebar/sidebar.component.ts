import { NgClass } from '@angular/common';
import { Component, signal } from '@angular/core';
import { TWDSidebarMenu } from '../../types/sidebar/sidebar-menu';
import { MenuSectionComponent } from './menu-section/menu-section.component';

@Component({
  selector: 'app-sidebar',
  imports: [NgClass, MenuSectionComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  protected toggleDropdownVal = signal<Boolean>(false);

  toggleDropdown() {
    this.toggleDropdownVal.set(!this.toggleDropdownVal());
  }

  colors = signal([
    '#7AD2D2',
    '#3A6FAF',
    '#EC7580',
    '#9BE8D8',
    '#FFC04A',
    '#6DAA9F',
    '#FFF3D9',
    '#F56A62',
    '#C4D291',
  ]);
  projects = signal([
    {
      name: 'DAM',
      favorite: false,
      pendingTasks: 3,
    },
    {
      name: 'DAW',
      favorite: false,
      pendingTasks: 0,
    },
    {
      name: 'IA BigData',
      favorite: true,
      pendingTasks: 6,
    },
  ]);

  protected navMenuSectionInfo = signal<TWDSidebarMenu>({
    title: 'Navigation',
    items: [
      {
        name: 'Hoy',
        pendingTasks: 2,
        icon: 'today',
      },
      {
        name: 'Próximo',
        pendingTasks: 0,
        icon: 'upcoming',
      },
    ],
  });

  protected favoriteMenuSectionInfo = signal<TWDSidebarMenu>({
    title: 'Favorite Projects',
    items: this.projects()
      .filter((p) => p.favorite)
      .map((p) => {
        return { name: p.name, pendingTasks: p.pendingTasks, icon: 'project' };
      }),
  });

  protected projectsMenuSectionInfo = signal<TWDSidebarMenu>({
    title: 'My Projects',
    items: this.projects().map((p) => {
      return { name: p.name, pendingTasks: p.pendingTasks, icon: 'project' };
    }),
  });
}
