import { NgClass } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'breadcrumb',
  imports: [NgClass],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css'
})
export class BreadcrumbComponent {
  public route = input<string>("default-route")

  public showIcon = input.required<boolean>();
  public onIconClick = output<boolean>();

  openSidebar(){
    this.onIconClick.emit(true)
  }
}
