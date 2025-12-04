import { Component, input } from '@angular/core';
import { TWDSidebarMenu } from '../../../types/sidebar/sidebar-menu';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'sidebar-menu-section',
  imports: [NgTemplateOutlet],
  templateUrl: './menu-section.component.html',
  styleUrl: './menu-section.component.css'
})
export class MenuSectionComponent {
  public menuSectionInfo = input.required<TWDSidebarMenu>()
}
