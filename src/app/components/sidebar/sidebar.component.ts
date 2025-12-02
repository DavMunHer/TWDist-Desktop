import { NgClass } from '@angular/common';
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  imports: [NgClass],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

  protected toggleDropdownVal = signal<Boolean>(false)

  toggleDropdown() {
    this.toggleDropdownVal.set(!this.toggleDropdownVal());
  }
}
