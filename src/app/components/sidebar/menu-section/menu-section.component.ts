import { Component, input, signal } from '@angular/core';
import { TWDSidebarMenu } from '../../../models/sidebar/sidebar-menu';
import { NgClass, NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'sidebar-menu-section',
  imports: [NgTemplateOutlet, NgClass],
  templateUrl: './menu-section.component.html',
  styleUrl: './menu-section.component.css'
})
export class MenuSectionComponent {
  public menuSectionInfo = input.required<TWDSidebarMenu>()
  public showPlusIcon = input<boolean>(false)

  protected projectIconColors = signal([
    '#7AD2D2',
    '#3A6FAF',
    '#EC7580',
    '#9BE8D8',
    '#FFC04A',
    '#6DAA9F',
    '#FFF3D9',
    '#F56A62',
    '#C4D291',
  ]);
}
