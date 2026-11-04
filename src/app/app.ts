import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styles: [],
  template: `
    <div class="mx-auto p-banana">
      <h1 class="text-2xl underline text-red-500 bg-red-400">Hello, {{ title().toUpperCase() }}</h1>
    </div>
    <div class="m-banana border">Test box</div>
    
    <router-outlet />
  `,
})
export class App {
  protected readonly title = signal('sages');
}
