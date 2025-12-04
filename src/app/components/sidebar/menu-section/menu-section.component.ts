import { Component, input } from '@angular/core';
import { TWDSidebarMenu } from '../../../types/sidebar/sidebar-menu';
import { NgClass, NgTemplateOutlet, NgComponentOutlet } from '@angular/common';

@Component({
  selector: 'sidebar-menu-section',
  imports: [NgTemplateOutlet, NgClass, NgComponentOutlet],
  templateUrl: './menu-section.component.html',
  styleUrl: './menu-section.component.css'
})
export class MenuSectionComponent {
  public menuSectionInfo = input.required<TWDSidebarMenu>()
  public showPlusIcon = input<boolean>(false)
}
