import { NgClass } from '@angular/common';
import { Component, input, output, ChangeDetectionStrategy, signal } from '@angular/core';
import { ClickOutsideDirective } from '@shared/directives/click-outside.directive';

@Component({
  selector: 'app-breadcrumb',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, ClickOutsideDirective],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css',
})
export class BreadcrumbComponent {
  public route = input<string>('default-route');

  public showIcon = input.required<boolean>();
  public iconClick = output<boolean>();
  protected showTaskFilterMenu = signal(false);
  protected selectedTaskFilter = signal<'all' | 'uncompleted' | 'completed'>('all');

  openSidebar() {
    this.iconClick.emit(true);
  }

  protected toggleTaskFilterMenu(): void {
    this.showTaskFilterMenu.update(isOpen => !isOpen);
  }

  protected closeTaskFilterMenu(): void {
    this.showTaskFilterMenu.set(false);
  }

  protected selectTaskFilter(option: 'all' | 'uncompleted' | 'completed'): void {
    this.selectedTaskFilter.set(option);
  }
}

