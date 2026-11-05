import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SharedUI } from '../../../shared/shared-module';

@Component({
  selector: 'app-page-not-found',
  imports: [...SharedUI, RouterLink],
  template: `
    <main
      class="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface p-6 text-on-surface"
    >
      <p class="text-title-md text-on-surface-variant">404</p>
      <h1 class="text-headline-sm">Page not found</h1>
      <p class="text-body-md text-on-surface-variant">
        The page you are looking for does not exist.
      </p>
      <a matButton="filled" routerLink="/">Go to home page</a>
    </main>
  `,
})
export class PageNotFound {}
