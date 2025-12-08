import { Component, input } from '@angular/core';

@Component({
  selector: 'breadcrumb',
  imports: [],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css'
})
export class BreadcrumbComponent {
  public route = input<string>("default-route")
}
