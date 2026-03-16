import { Component, input, output } from '@angular/core';
import { BreadcrumbComponent } from '@features/projects/presentation/components/home/project-view/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-today',
  imports: [BreadcrumbComponent],
  templateUrl: './today.component.html',
  styleUrl: './today.component.css'
})
export class TodayComponent {
  public showIcon = input.required<boolean>();
  public showIconChange = output<boolean>();

  handleIconChange() {
    this.showIconChange.emit(true);
  }
}
