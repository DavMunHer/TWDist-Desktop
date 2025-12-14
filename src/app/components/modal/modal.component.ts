import { Component, computed } from '@angular/core';
import { ModalService } from '../../services/modal.service';
import { ConfigurationComponent } from "./configuration/configuration.component";

@Component({
  selector: 'app-modal',
  imports: [ConfigurationComponent],
  standalone: true,
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {
  modalType = computed(()=> this.modalService.modalType())

  constructor(private modalService: ModalService) { }

  close() {
    this.modalService.close();
  }
}
