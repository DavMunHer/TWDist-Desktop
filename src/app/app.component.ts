import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModalComponent } from "@shared/ui/modal/modal.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'TWDist-desktop';

}
