import { NgTemplateOutlet } from '@angular/common';
import { Component, output } from '@angular/core';

@Component({
  selector: 'section-adder',
  imports: [NgTemplateOutlet],
  templateUrl: './section-adder.component.html',
  styleUrl: './section-adder.component.css'
})
export class SectionAdderComponent {
  public onAdderClick = output()


  protected handleClick() {
    this.onAdderClick.emit()
  }
}
