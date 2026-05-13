import { Component, ChangeDetectionStrategy, inject, computed, effect, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthStore } from '@features/auth/presentation/store/auth.store';

function passwordsMustDifferValidator(control: AbstractControl): ValidationErrors | null {
  const oldPassword = control.get('oldPassword')?.value;
  const newPassword = control.get('newPassword')?.value;
  if (oldPassword && newPassword && oldPassword === newPassword) {
    return { passwordsMustDiffer: true };
  }
  return null;
}

@Component({
  selector: 'app-profile-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnDestroy {
  private readonly authStore = inject(AuthStore);
  private readonly fb = inject(FormBuilder);

  readonly username = computed(() => this.authStore.user()?.username ?? '');
  readonly email = computed(() => this.authStore.user()?.email ?? '');
  readonly profileStatus = computed(() => this.authStore.profileStatus());
  readonly profileError = computed(() => this.authStore.profileError());

  readonly usernameForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
  });

  readonly passwordForm: FormGroup = this.fb.group({
    oldPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(40)]],
  }, { validators: passwordsMustDifferValidator });

  constructor() {
    effect(() => {
      this.usernameForm.patchValue({ username: this.username() }, { emitEvent: false });
    });

    effect(() => {
      if (this.profileStatus() === 'success') {
        this.passwordForm.reset();
      }
    });
  }

  ngOnDestroy(): void {
    this.authStore.resetProfileStatus();
  }

  submitUsername(): void {
    if (this.usernameForm.invalid) return;
    this.authStore.updateUsername(this.usernameForm.value.username);
  }

  submitPassword(): void {
    if (this.passwordForm.invalid) return;
    const { oldPassword, newPassword } = this.passwordForm.value;
    this.authStore.updatePassword(oldPassword, newPassword);
  }

  changePicture() {
    console.log('Change picture clicked');
  }

  deletePicture() {
    console.log('Delete picture clicked');
  }

  deleteAccount() {
    console.log('Account deleted');
  }
}
