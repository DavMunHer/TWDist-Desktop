import { Component, computed } from '@angular/core';
import { ModalService } from '../../services/modal.service';
import { ConfigurationComponent } from "./configuration/configuration.component";
import { ProfileComponent } from './profile/profile.component';

@Component({
  selector: 'app-modal',
  imports: [ConfigurationComponent, ProfileComponent],
  standalone: true,
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {
  modalType = computed(() => this.modalService.modalType())

  constructor(private modalService: ModalService) { }

  modalTitle = computed(() => {
    const data = this.modalService.modalData();
    return data?.title ?? '';
  });

  close() {
    this.modalService.close();
  }
}
