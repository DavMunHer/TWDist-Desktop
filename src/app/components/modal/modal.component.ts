import { Component, computed } from '@angular/core';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-modal',
  imports: [],
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
