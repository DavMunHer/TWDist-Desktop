import { NgClass } from '@angular/common';
import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-breadcrumb',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css',
})
export class BreadcrumbComponent {
  public route = input<string>('default-route');

  public showIcon = input.required<boolean>();
  public iconClick = output<boolean>();

  openSidebar() {
    this.iconClick.emit(true);
  }
}

