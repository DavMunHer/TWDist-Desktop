import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { BreadcrumbComponent } from '@shared/ui/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-upcoming',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
