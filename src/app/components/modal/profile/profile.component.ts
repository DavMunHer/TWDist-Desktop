import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'profile-modal',
  imports: [FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

  name = 'Oscar';
  email = 'oscar@gmail.com';
  oldPassword = '';
  newPassword = '';

  changePicture() {
    console.log('Change picture clicked');
  }

  deletePicture() {
    console.log('Delete picture clicked');
  }

  updateName() {
    console.log('Updated name:', this.name);
  }

  updateEmail() {
    console.log('Updated email:', this.email);
  }

  updatePassword() {
    console.log('Old:', this.oldPassword, 'New:', this.newPassword);
  }

  deleteAccount() {
    console.log('Account deleted');
  }
}
