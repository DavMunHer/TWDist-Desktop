import { NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';
import { TWDSidebarMenu, TWDSidebarMenuItem } from '@shared/ui/sidebar/sidebar-menu';

@Component({
  selector: 'app-sidebar-menu-section',
  imports: [NgTemplateOutlet, NgClass],
  templateUrl: './menu-section.component.html',
  styleUrl: './menu-section.component.css',
})
export class MenuSectionComponent {
  public menuSectionInfo = input.required<TWDSidebarMenu>();
  public showPlusIcon = input<boolean>(false);

  public menuItemClick = output<TWDSidebarMenuItem>();
  public favoriteClick = output<string>();
  public editClick = output<string>();
  public deleteClick = output<string>();
  public plusIconClick = output<void>();

  protected openMenuProjectId = signal<string | null>(null);

  private readonly projectIconColors = [
    '#008B8B',
    '#3A6FAF',
    '#D32F2F',
    '#00897B',
    '#E65100',
    '#455A64',
    '#FBC02D',
    '#C62828',
    '#689F38',
  ];

  getProjectColor(projectId: string | undefined): string {
    if (!projectId) return '#222';
    let hash = 0;
    for (let i = 0; i < projectId.length; i++) {
      hash = (hash * 31 + projectId.charCodeAt(i)) | 0;
    }
    const index = Math.abs(hash) % this.projectIconColors.length;
    return this.projectIconColors[index];
  }

  onPlusIconClick(): void {
    this.plusIconClick.emit();
  }

  onMenuItemClick(item: TWDSidebarMenuItem): void {
    this.menuItemClick.emit(item);
  }

  toggleProjectMenu(projectId: string | undefined, event: Event): void {
    event.stopPropagation();
    if (!projectId) return;
    const current = this.openMenuProjectId();
    this.openMenuProjectId.set(current === projectId ? null : projectId);
  }

  closeMenu(event: Event): void {
    event.stopPropagation();
    this.openMenuProjectId.set(null);
  }

  onEditClick(projectId: string | undefined, event: Event): void {
    event.stopPropagation();
    if (!projectId) return;
    this.editClick.emit(projectId);
    this.openMenuProjectId.set(null);
  }

  onFavoriteClick(projectId: string | undefined, event: Event): void {
    event.stopPropagation();
    if (!projectId) return;
    this.favoriteClick.emit(projectId);
    this.openMenuProjectId.set(null);
  }

  onDeleteClick(projectId: string | undefined, event: Event): void {
    event.stopPropagation();
    if (!projectId) return;
    this.deleteClick.emit(projectId);
    this.openMenuProjectId.set(null);
  }
}

