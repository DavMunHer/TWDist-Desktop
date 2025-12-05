import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'section-title',
  imports: [NgClass],
  templateUrl: './section-title.component.html',
  styleUrl: './section-title.component.css'
})
export class SectionTitleComponent {
  public title = input<string>("")
  public titleStyle = input<"normal" | "bold">("normal")
}
