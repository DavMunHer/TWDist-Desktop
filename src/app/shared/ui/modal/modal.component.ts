import { Component, computed, inject, Injector, ViewChild, ViewContainerRef, ChangeDetectionStrategy } from '@angular/core';
import { ModalRef, MODAL_DATA } from '@shared/ui/modal/modal-ref';
import { ModalService } from '@shared/ui/modal/modal.service';

@Component({
  selector: 'app-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
})
export class ModalComponent {
  private readonly modalService = inject(ModalService);
  private readonly injector = inject(Injector);

  @ViewChild('outlet', { read: ViewContainerRef })
  set outlet(vcr: ViewContainerRef | undefined) {
    if (!vcr) return;
    this.renderContent(vcr);
  }

  readonly activeModal = computed(() => this.modalService.activeModal());
  readonly title = computed(() => this.modalService.activeModal()?.config.title ?? '');

  close(): void {
    this.modalService.close();
  }

  private renderContent(vcr: ViewContainerRef): void {
    const modal = this.activeModal();
    if (!modal) return;

    vcr.clear();

    const childInjector = Injector.create({
      parent: this.injector,
      providers: [
        {
          provide: ModalRef,
          useValue: new ModalRef(() => this.close()),
        },
        {
          provide: MODAL_DATA,
          useValue: modal.config.data ?? {},
        },
      ],
    });

    vcr.createComponent(modal.component, { injector: childInjector });
  }
}
