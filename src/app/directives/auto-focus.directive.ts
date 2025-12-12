import { AfterViewInit, Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[twdAutoFocus]'
})
export class AutoFocusDirective implements AfterViewInit {
  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    setTimeout(() => this.el.nativeElement.focus(), 0);
  }
}
