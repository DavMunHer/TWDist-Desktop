import { Component, input, output } from '@angular/core';
import { BreadcrumbComponent } from '@features/projects/presentation/components/home/project-view/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-upcoming',
  imports: [BreadcrumbComponent],
  templateUrl: './upcoming.component.html',
  styleUrl: './upcoming.component.css',
})
export class UpcomingComponent {
  public showIcon = input.required<boolean>();
  public showIconChange = output<boolean>();

  handleIconChange() {
    this.showIconChange.emit(true);
  }
}
