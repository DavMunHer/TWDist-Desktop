import { Component, computed } from '@angular/core';
import { ModalService } from '../../services/modal.service';
import { ConfigurationComponent } from "./configuration/configuration.component";
import { ProfileComponent } from './profile/profile.component';
import { CreateProjectComponent } from "./create-project/create-project.component";

@Component({
  selector: 'app-modal',
  imports: [ConfigurationComponent, ProfileComponent, CreateProjectComponent],
  standalone: true,
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {

  constructor(private modalService: ModalService) { }

  modalType = computed(() => this.modalService.modalType())
  modalTitle = computed(() => {
    const data = this.modalService.modalData();
    return data?.title ?? '';
  });

  close() {
    this.modalService.close();
  }
}
