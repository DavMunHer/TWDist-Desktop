import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { SignupComponent } from './components/auth/signup/signup.component';
import { HomeComponent } from './components/home/home.component';
import { authGuard } from './features/auth/presentation/guards/auth.guard';

export const routes: Routes = [
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/signup', component: SignupComponent },
  { path: 'projects/:id', component: HomeComponent, canActivate: [authGuard] },
  { path: 'projects/upcoming', component: HomeComponent, canActivate: [authGuard] },
  { path: 'projects/today', component: HomeComponent, canActivate: [authGuard] },
  {
    path: "**",
    redirectTo: "auth/login"
  }
];
