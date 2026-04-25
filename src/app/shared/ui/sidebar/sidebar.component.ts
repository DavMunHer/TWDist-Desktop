import { NgClass } from '@angular/common';
import { Component, computed, input, output, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { ModalService } from '@shared/ui/modal/modal.service';
import { ConfigurationComponent } from '@shared/ui/modal/configuration/configuration.component';
import { ProfileComponent } from '@shared/ui/modal/profile/profile.component';
import { TWDSidebarMenu, TWDSidebarMenuItem } from '@shared/ui/sidebar/sidebar-menu';
import { MenuSectionComponent } from '@shared/ui/sidebar/sidebar-menu-section/menu-section.component';
import { ClickOutsideDirective } from '@shared/directives/click-outside.directive';
import { AuthStore } from '@features/auth/presentation/store/auth.store';

@Component({
  selector: 'app-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, MenuSectionComponent, ClickOutsideDirective],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  private readonly modalService = inject(ModalService);
  private readonly authStore = inject(AuthStore);

  readonly user = computed(() => this.authStore.user());

  protected toggleDropdownVal = signal<boolean>(false);

  public sidebarVisibleInput = input.required<boolean>();
  public sidebarClose = output<boolean>();

  public navMenuSectionInfo = input.required<TWDSidebarMenu>();
  public favoriteMenuSectionInfo = input.required<TWDSidebarMenu>();
  public projectsMenuSectionInfo = input.required<TWDSidebarMenu>();

  public menuItemClick = output<TWDSidebarMenuItem>();
  public favoriteClick = output<string>();
  public editClick = output<string>();
  public deleteClick = output<string>();
  public createProjectClick = output<void>();

  openProfileModal(): void {
    this.closeDropdown();
    this.modalService.open(ProfileComponent, { title: 'Profile' });
  }

  openConfigurationModal(): void {
    this.closeDropdown();
    this.modalService.open(ConfigurationComponent, { title: 'Configuration' });
  }

  onCreateProjectClick(): void {
    this.createProjectClick.emit();
  }

  toggleSidebar() {
    this.sidebarClose.emit(false);
  }

  toggleDropdown() {
    this.toggleDropdownVal.set(!this.toggleDropdownVal());
  }

  closeDropdown(): void {
    this.toggleDropdownVal.set(false);
  }

  protected favoriteSectionHasItems = computed(() => this.favoriteMenuSectionInfo().items.length > 0);
}

