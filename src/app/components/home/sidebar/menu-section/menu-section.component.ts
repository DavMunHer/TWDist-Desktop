import { Component, input, signal, inject } from '@angular/core';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { TWDSidebarMenu } from '../../../../shared/models/sidebar-menu';
import { ModalService } from '../../../../services/modal.service';
import { TWDModalType } from '../../../../shared/models/modals-type';
import { ProjectStore } from '../../../../features/projects/presentation/store/project.store';

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

  constructor(private modalService: ModalService) { }

  protected projectIconColors = signal([
    '#7AD2D2',
    '#3A6FAF',
    '#EC7580',
    '#9BE8D8',
    '#FFC04A',
    '#6DAA9F',
    '#FFF3D9',
    '#F56A62',
    '#C4D291',
  ]);

  openModal(type: TWDModalType, title: string) {
    console.log('click');
    this.modalService.open(type, { title });
  }

  toggleFavorite(projectId: string | undefined, event: Event): void {
    event.stopPropagation();
    if (!projectId) return;

    this.projectStore.toggleProjectFavorite(projectId);
  }
}
