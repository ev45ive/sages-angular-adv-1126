import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SharedUI } from './shared';

@Component({
  imports: [RouterOutlet, SharedUI],
  selector: 'app-root',
  styles: [],
  template: `
    <div class="mx-auto container grid gap-5 py-5">
      <mat-toolbar class="border-b border-outline-variant flex justify-between gap-5">
        <span class="text-title-md">CRM System</span>
        <nav aria-label="Main" class="flex gap-4">
          <a
            routerLink="/contacts"
            routerLinkActive="text-primary "
            ariaCurrentWhenActive="page"
            >Contacts</a
          >
          <a
            routerLink="/deals"
            routerLinkActive="text-primary "
            ariaCurrentWhenActive="page"
            >Deals</a
          >
        </nav>
        <button mat-raised-button="">Login</button>
      </mat-toolbar>

      <router-outlet />
    </div>
  `,
})
export class App {
  protected readonly title = signal('sages');
}
