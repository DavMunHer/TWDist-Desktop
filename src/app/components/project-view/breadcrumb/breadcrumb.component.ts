import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'breadcrumb',
  imports: [NgClass],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css'
})
export class BreadcrumbComponent {
  public route = input<string>("default-route")
  public invisible = input<boolean>(false);


}
