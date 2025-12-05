import { Routes } from '@angular/router';
import { ProjectViewComponent } from './components/project-view/project-view.component';

export const routes: Routes = [
    // FIXME: Delete below path, since it was only for debugging purposes
    {
        component: ProjectViewComponent,
        path: "project-view",
    }
];
