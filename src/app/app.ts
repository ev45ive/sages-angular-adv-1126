import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DealsPage } from './deals-page/deals-page';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styles: [],
  template: `
    <div class="mx-auto p-banana">
      <h1 class="text-2xl text-primary ">Hello, {{ title().toUpperCase() }}</h1>
    </div>
    
    <!-- <app-deals-page/> -->
    <router-outlet />
  `,
})
export class App {
  protected readonly title = signal('sages');
}
