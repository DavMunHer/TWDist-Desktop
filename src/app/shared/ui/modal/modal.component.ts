import { Component, computed, inject } from '@angular/core';
import { ModalService } from '@shared/ui/modal/modal.service';
import { ConfigurationComponent } from "@shared/ui/modal/configuration/configuration.component";
import { ProfileComponent } from '@shared/ui/modal/profile/profile.component';
import { CreateProjectComponent } from "@features/projects/presentation/components/create-project/create-project.component";

@Component({
  selector: 'app-modal',
  imports: [ConfigurationComponent, ProfileComponent, CreateProjectComponent],
  standalone: true,
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {
  private modalService = inject(ModalService);


  modalType = computed(() => this.modalService.modalType())
  modalTitle = computed(() => {
    const data = this.modalService.modalData() as { title?: string } | null;
    return data?.title ?? '';
  });

  close() {
    this.modalService.close();
  }
}
