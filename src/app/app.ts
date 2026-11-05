import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styles: [],
  template: `
    <div class="mx-auto container">
      <h1 class="text-2xl ">Hello, {{ title().toUpperCase() }}</h1>
    </div>

    <!-- <app-deals-page/> -->
    <div class="mx-auto container">
      <router-outlet />
    </div>
  `,
})
export class App {
  protected readonly title = signal('sages');
}
