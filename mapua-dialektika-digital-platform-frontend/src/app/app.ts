import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: '../app/features/login-page/login/login-page.css'
})
export class App {
  protected readonly title = signal('mapua-dialektika-digital-platform-frontend');
}
