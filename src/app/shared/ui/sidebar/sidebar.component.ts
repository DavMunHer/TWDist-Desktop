import { NgClass } from '@angular/common';
import { Component, computed, input, output, signal, inject } from '@angular/core';
import { ModalService } from '@shared/ui/modal/modal.service';
import { TWDModalType } from '@shared/ui/modal/modals-type';
import { TWDSidebarMenu, TWDSidebarMenuItem } from '@shared/ui/sidebar/sidebar-menu';
import { MenuSectionComponent } from '@shared/ui/sidebar/sidebar-menu-section/menu-section.component';

@Component({
  selector: 'app-sidebar',
  imports: [NgClass, MenuSectionComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  private readonly modalService = inject(ModalService);

  protected toggleDropdownVal = signal<boolean>(false);

  public sidebarVisibleInput = input.required<boolean>();
  public sidebarClose = output<boolean>();

  public navMenuSectionInfo = input.required<TWDSidebarMenu>();
  public favoriteMenuSectionInfo = input.required<TWDSidebarMenu>();
  public projectsMenuSectionInfo = input.required<TWDSidebarMenu>();

  public menuItemClick = output<TWDSidebarMenuItem>();
  public favoriteClick = output<string>();
  public deleteClick = output<string>();

  openModal(type: TWDModalType, title: string) {
    this.modalService.open(type, { title });
  }

  toggleSidebar() {
    this.sidebarClose.emit(false);
  }

  toggleDropdown() {
    this.toggleDropdownVal.set(!this.toggleDropdownVal());
  }

  protected favoriteSectionHasItems = computed(() => this.favoriteMenuSectionInfo().items.length > 0);
}

