import { NgClass } from '@angular/common';
import { Component, input, output, signal, computed, inject } from '@angular/core';
import { TWDSidebarMenu } from '../../../shared/models/sidebar-menu';
import { MenuSectionComponent } from './menu-section/menu-section.component';
import { ModalService } from '../../../services/modal.service';
import { TWDModalType } from '../../../shared/models/modals-type';
import { ProjectStore } from '../../../features/projects/presentation/store/project.store';
import { SectionStore } from '../../../features/projects/presentation/store/section.store';
import { TaskStore } from '../../../features/projects/presentation/store/task.store';

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

  private projectStore = inject(ProjectStore);
  private sectionStore = inject(SectionStore);
  private taskStore = inject(TaskStore);

  constructor(private modalService: ModalService) { }

  openModal(type: TWDModalType, title: string) {
    this.modalService.open(type, { title });
  }

  toggleSidebar() {
    // When the action of clicking the icon is triggered, we will send an output to update the value of the sidebarVisible
    this.onSidebarClose.emit(false)
  }

  toggleDropdown() {
    this.toggleDropdownVal.set(!this.toggleDropdownVal());
  }

  // Get real projects from the ProjectStore
  protected projects = computed(() =>
    this.projectStore.projects().map((project) => {
      // Compute pending tasks by traversing sections → tasks
      const sections = this.sectionStore.sections();
      const tasks = this.taskStore.tasks();

      let pendingCount = 0;

      // For each section in this project
      for (const sectionId of project.sectionIds) {
        const section = sections[sectionId];
        if (!section) continue;

        // For each task in this section
        for (const taskId of section.taskIds) {
          const task = tasks[taskId];
          if (!task) continue;

          // Count incomplete tasks
          if (!task.completed) {
            pendingCount++;
          }
        }
      }

      return {
        id: project.id,
        name: project.name,
        favorite: project.favorite,
        pendingTasks: pendingCount,
      };
    })
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
