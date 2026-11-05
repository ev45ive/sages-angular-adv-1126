import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SharedUI } from './shared';

@Component({
  imports: [RouterOutlet, SharedUI],
  selector: 'app-root',
  styles: [],
  template: `
    <div class="mx-auto container grid gap-5 py-5">
      <div class="flex justify-between gap-5">
        <h1 class="text-2xl">CRM</h1>

        <button mat-raised-button="">Login</button>
      </div>

      <router-outlet />
    </div>
  `,
})
export class App {
  protected readonly title = signal('sages');
}
