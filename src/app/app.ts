import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styles: [],
  template: `
    <h1>Hello, {{ title().toUpperCase() }}</h1>

    <router-outlet />
  `,
})
export class App {
  protected readonly title = signal('sages');
}
