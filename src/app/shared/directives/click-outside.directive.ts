import { Directive, ElementRef, HostListener, inject, output } from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
})
export class ClickOutsideDirective {
  public clickOutside = output<MouseEvent>();

  private readonly elementRef = inject(ElementRef<HTMLElement>);

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    const target = event.target as Node | null;

    if (target && !this.elementRef.nativeElement.contains(target)) {
      this.clickOutside.emit(event);
    }
  }
}