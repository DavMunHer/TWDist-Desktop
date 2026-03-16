import { Routes } from '@angular/router';
import { LoginComponent } from '@features/auth/presentation/components/login/login.component';
import { SignupComponent } from '@features/auth/presentation/components/signup/signup.component';
import { HomeComponent } from '@features/projects/presentation/components/home/home.component';
import { authGuard } from '@features/auth/presentation/guards/auth.guard';
import { TodayComponent } from '@features/today/presentation/components/today/today.component';
import { UpcomingComponent } from '@features/upcoming/presentation/components/upcoming/upcoming.component';

export const routes: Routes = [
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/signup', component: SignupComponent },
  { path: 'projects/:id', component: HomeComponent, canActivate: [authGuard] },
  { path: 'projects/upcoming', component: UpcomingComponent, canActivate: [authGuard] },
  { path: 'projects/today', component: TodayComponent, canActivate: [authGuard] },
  {
    path: "**",
    redirectTo: "auth/login"
  }
];
