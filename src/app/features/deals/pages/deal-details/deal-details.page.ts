import { Component, inject, input } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { DEAL_DETAILS_SOURCE } from '../../data/deals.ports';
import { injectContactLookup } from '../../data/inject-contact-lookup';
import { DealDetailsCard } from '../../ui/deal-details-card/deal-details-card';

/**
 * Routed page of `/deals/:dealId`.
 * - **What:** a container component: loads one deal through its port and renders the presentational details card; its outlet hosts the tasks page.
 * - **Why:** `dealId` arrives as a router-bound input, so the page needs no `ActivatedRoute`.
 */
@Component({
  imports: [DealDetailsCard, RouterOutlet],
  selector: 'app-deal-details-page',
  template: `
    @if (error(); as message) {
      <p role="alert" class="mb-2 text-body-md text-error">{{ message }}</p>
    }
    @if (loading()) {
      <p class="mb-2 text-body-md">Loading ...</p>
    }

    @if (deal(); as value) {
      <app-deal-details-card
        [deal]="value"
        [contactName]="contact.label()"
        (editRequested)="onEdit()"
      />
      <div class="mt-4">
        <router-outlet />
      </div>
    }
  `,
})
export class DealDetailsPage {
  private readonly source = inject(DEAL_DETAILS_SOURCE);
  private readonly router = inject(Router);

  // Bound from the :dealId route param (withComponentInputBinding)
  readonly dealId = input.required<string>();

  protected readonly deal = this.source.selectDealById(this.dealId);
  protected readonly loading = this.source.selectLoadingById(this.dealId);
  protected readonly error = this.source.selectError;
  protected readonly contact = injectContactLookup(() => this.deal()?.contactId);

  constructor() {
    this.source.loadDeal(this.dealId);
  }

  protected onEdit(): void {
    void this.router.navigate(['/deals', this.dealId(), 'edit'], {
      queryParamsHandling: 'preserve',
    });
  }
}
