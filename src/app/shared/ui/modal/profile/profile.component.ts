import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthStore } from '@features/auth/presentation/store/auth.store';

@Component({
  selector: 'app-profile-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  private readonly authStore = inject(AuthStore);

  readonly username = computed(() => this.authStore.user()?.username ?? '');
  readonly email = computed(() => this.authStore.user()?.email ?? '');

  oldPassword = '';
  newPassword = '';

  changePicture() {
    console.log('Change picture clicked');
  }

  deletePicture() {
    console.log('Delete picture clicked');
  }

  updateName() {
    console.log('Updated name:', this.username());
  }

  updateEmail() {
    console.log('Updated email:', this.email());
  }

  updatePassword() {
    console.log('Old:', this.oldPassword, 'New:', this.newPassword);
  }

  deleteAccount() {
    console.log('Account deleted');
  }
}
