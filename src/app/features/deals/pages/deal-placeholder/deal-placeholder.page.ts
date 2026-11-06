import { Component } from '@angular/core';

/**
 * Empty state of the layout outlet.
 * - **Why:** gives `/deals` a child route, so the outlet is never empty and the layout needs no special case.
 */
@Component({
  selector: 'app-deal-placeholder-page',
  template: ` <p class="my-10 text-center text-body-md text-on-surface-variant">Select a deal</p> `,
})
export class DealPlaceholderPage {}
