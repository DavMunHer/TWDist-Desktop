import { AutoFocusDirective } from '@shared/directives/auto-focus.directive';
import { ElementRef, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

describe('AutoFocusDirective', () => {
  it('should create an instance', () => {
    const elementRef = new ElementRef(document.createElement('input'));
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: ElementRef, useValue: elementRef },
      ]
    });
    const directive = TestBed.runInInjectionContext(() => new AutoFocusDirective());
    expect(directive).toBeTruthy();
  });
});
