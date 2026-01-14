import { Component, effect, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStore } from '../../../features/auth/presentation/store/auth.store';

@Component({
  selector: 'signup',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  private authStore = inject(AuthStore);
  private router = inject(Router);

  constructor() {
    // Navigate to login when registration succeeds
    effect(() => {
      if (this.authStore.isRegistrationSuccess()) {
        this.router.navigate(['/auth/login']);
      }
    });
  }

  protected signupForm = new FormGroup({
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    username: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
  });

  signup() {
    this.authStore.register({
      email: this.signupForm.controls.email.value,
      username: this.signupForm.controls.username.value,
      password: this.signupForm.controls.password.value,
    });
  }
}
