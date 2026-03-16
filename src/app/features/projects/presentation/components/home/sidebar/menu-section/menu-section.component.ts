import { Component, input, signal, inject } from '@angular/core';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { Router } from '@angular/router';
import { TWDSidebarMenu, TWDSidebarMenuItem } from '@shared/ui/sidebar/sidebar-menu';
import { ModalService } from '@shared/ui/modal/modal.service';
import { TWDModalType } from '@shared/ui/modal/modals-type';
import { ProjectStore } from '@features/projects/presentation/store/project.store';

@Component({
  selector: 'sidebar-menu-section',
  imports: [NgTemplateOutlet, NgClass],
  templateUrl: './menu-section.component.html',
  styleUrl: './menu-section.component.css'
})
export class MenuSectionComponent {
  public menuSectionInfo = input.required<TWDSidebarMenu>()
  public showPlusIcon = input<boolean>(false)

  private projectStore = inject(ProjectStore);
  private readonly router = inject(Router);

  protected openMenuProjectId = signal<string | null>(null);

  constructor(private modalService: ModalService) { }

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

  openModal(type: TWDModalType, title: string) {
    console.log('click');
    this.modalService.open(type, { title });
  }

  selectProject(projectId: string | undefined): void {
    if (!projectId) return;
    this.projectStore.loadProject(projectId);
  }

  onMenuItemClick(item: TWDSidebarMenuItem): void {
    if (item.route) {
      this.router.navigateByUrl(item.route);
      return;
    }

    this.selectProject(item.id);
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

  onFavoriteClick(projectId: string | undefined, event: Event): void {
    event.stopPropagation();
    if (!projectId) return;
    this.projectStore.toggleProjectFavorite(projectId);
    this.openMenuProjectId.set(null);
  }

  onDeleteClick(projectId: string | undefined, event: Event): void {
    event.stopPropagation();
    if (!projectId) return;
    this.openMenuProjectId.set(null);
    this.projectStore.deleteProject(projectId);
  }
}
