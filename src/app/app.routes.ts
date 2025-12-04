import { Routes } from '@angular/router';
import { ProjectSectionComponent } from './components/project-section/project-section.component';
import { MenuSectionComponent } from './components/sidebar/menu-section/menu-section.component';

export const routes: Routes = [
  {
    component: ProjectSectionComponent,
    path: 'project-section',
  },
  {
    component: MenuSectionComponent,
    path: 'deleteme',
  },
];
