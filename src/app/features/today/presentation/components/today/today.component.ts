import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { BreadcrumbComponent } from '@shared/ui/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-today',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
