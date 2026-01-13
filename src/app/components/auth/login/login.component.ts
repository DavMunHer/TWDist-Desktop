import { Component, effect, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginCredentialsDto } from '../../../features/auth/infrastructure/dto/login-credentials.dto';
import { AuthStore } from '../../../features/auth/presentation/store/auth.store';
import { Router } from '@angular/router';

@Component({
  selector: 'login',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  protected loginForm = new FormGroup({
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
  });

  private authStore = inject(AuthStore);
  private router = inject(Router);

  constructor() {
    // Watch isAuthenticated and redirect when user logs in
    effect(() => {
      if (this.authStore.isAuthenticated()) {
        this.router.navigate(['/projects/upcoming']);
      }
    });
  }

  login() {
    if (this.loginForm.invalid) {
      return;
    }

    const credentials: LoginCredentialsDto = {
      email: this.loginForm.controls.email.value,
      password: this.loginForm.controls.password.value,
    };
    
    this.authStore.login(credentials);
  }
}

