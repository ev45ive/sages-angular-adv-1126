import { CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Deal, DEAL_STAGE_LABELS } from '@feature/deals';

/**
 * List of the deals related to a contact.
 * - **What:** presentational component; deals arrive as an input from the page.
 * - **Why:** shows another feature's data using only its public API (`Deal` type and labels from `@feature/deals`).
 */
@Component({
  imports: [CurrencyPipe, RouterLink],
  selector: 'app-contact-related-deals',
  host: {
    class: 'block',
  },
  template: `
    <section aria-labelledby="related-deals-title" class="flex flex-col gap-2">
      <h2 id="related-deals-title" class="text-title-md">Related deals</h2>

      @if (loading()) {
        <p class="text-body-md">Loading ...</p>
      }

      <ul class="flex flex-col gap-2">
        @for (deal of deals(); track deal.id) {
          <li>
            <a
              class="flex items-center justify-between gap-4 rounded-xl bg-surface-container-low p-4 text-on-surface no-underline hover:bg-surface-container focus-visible:outline-2 focus-visible:outline-offset-2"
              [routerLink]="['/deals', deal.id]"
            >
              <span class="min-w-0 truncate text-title-sm">{{ deal.title }}</span>
              <span class="shrink-0 text-body-sm text-on-surface-variant">
                {{ stageLabels[deal.stage] }} ·
                {{ deal.value.amount | currency: deal.value.currency : 'symbol' : '1.0-0' }}
              </span>
            </a>
          </li>
        } @empty {
          @if (!loading()) {
            <li class="text-body-md text-on-surface-variant">No deals for this contact.</li>
          }
        }
      </ul>
    </section>
  `,
})
export class ContactRelatedDeals {
  readonly deals = input.required<readonly Deal[]>();
  readonly loading = input(false);

  protected readonly stageLabels = DEAL_STAGE_LABELS;
}
