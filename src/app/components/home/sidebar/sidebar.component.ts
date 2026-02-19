import { NgClass } from '@angular/common';
import { Component, input, output, signal, computed, inject } from '@angular/core';
import { TWDSidebarMenu } from '../../../shared/models/sidebar-menu';
import { MenuSectionComponent } from './menu-section/menu-section.component';
import { ModalService } from '../../../services/modal.service';
import { TWDModalType } from '../../../shared/models/modals-type';
import { ProjectStore } from '../../../features/projects/presentation/store/project.store';
import { ProjectSummaryStore } from '../../../features/projects/presentation/store/project-summary.store';

@Component({
  selector: 'app-sidebar',
  imports: [NgClass, MenuSectionComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  protected toggleDropdownVal = signal<boolean>(false);

  public sidebarVisibleInput = input.required<boolean>();
  public onSidebarClose = output<boolean>();

  private readonly projectStore = inject(ProjectStore);
  private readonly summaryStore = inject(ProjectSummaryStore);

  constructor(private modalService: ModalService) { }

  openModal(type: TWDModalType, title: string) {
    this.modalService.open(type, { title });
  }

  toggleSidebar() {
    this.onSidebarClose.emit(false)
  }

  toggleDropdown() {
    this.toggleDropdownVal.set(!this.toggleDropdownVal());
  }

  protected projects = computed(() =>
    this.projectStore.projects().map(p => ({
      id: p.id,
      name: p.name,
      favorite: p.favorite,
      pendingTasks: this.summaryStore.pendingCountFor(p.id, p.sectionIds),
    })),
  );

  protected navMenuSectionInfo = computed<TWDSidebarMenu>(() => ({
    title: 'Navigation',
    items: [
      {
        name: 'Hoy',
        pendingTasks: 2,
        icon: 'today',
      },
      {
        name: 'Próximo',
        pendingTasks: 0,
        icon: 'upcoming',
      },
    ],
  }));

  protected favoriteMenuSectionInfo = computed<TWDSidebarMenu>(() => ({
    title: 'Favorite Projects',
    items: this.projects()
      .filter((p) => p.favorite)
      .map((p) => {
        return { id: p.id, name: p.name, pendingTasks: p.pendingTasks, icon: 'project', favorite: p.favorite };
      }),
  }));

  protected projectsMenuSectionInfo = computed<TWDSidebarMenu>(() => ({
    title: 'My Projects',
    items: this.projects().map((p) => {
      return { id: p.id, name: p.name, pendingTasks: p.pendingTasks, icon: 'project', favorite: p.favorite };
    }),
  }));
}
