import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { SignupComponent } from './components/auth/signup/signup.component';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
  { path: 'projects/:id', component: HomeComponent },
  { path: 'projects/upcoming', component: HomeComponent },
  {
    path: 'projects',
    //TODO: Projects view
    redirectTo: "projects/1"
  },
  {
    path: 'auth/login',
    component: LoginComponent,
  },
  {
    path: 'auth/signup',
    component: SignupComponent,
  },
  {
    path: "**",
    //TODO: Make 404 page
    redirectTo: "projects/1"
  }
];
