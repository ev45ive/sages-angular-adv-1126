import { Component, inject, input } from '@angular/core';
import { SharedForms } from '@shared';
import { ContactsStore } from '../../data/contacts.store';
import { ContactFullDetailsCard } from '../../ui/contact-full-details-card/contact-full-details-card';
import { ContactRelatedDeals } from '../../ui/contact-related-deals/contact-related-deals';

@Component({
  selector: 'app-contact-details-page',
  imports: [...SharedForms, ContactFullDetailsCard, ContactRelatedDeals],
  template: `
    <main class="flex flex-col gap-4 bg-surface p-4 text-on-surface">
      <div>
        <button matButton="text" type="button" (click)="back()">Back to search</button>
      </div>

      @if (loading()) {
        <p class="text-body-md">Loading ...</p>
      }

      @if (error(); as message) {
        <p role="alert" class="text-body-md text-error">{{ message }}</p>
      }

      @if (contact(); as value) {
        <app-contact-full-details-card [contact]="value" />
        <app-contact-related-deals [deals]="relatedDeals()" [loading]="relatedDealsLoading()" />
      }
    </main>
  `,
})
export class ContactDetailsPage {
  private readonly store = inject(ContactsStore);

  // Bound from the :contactId route param (withComponentInputBinding)
  readonly contactId = input.required<string>();

  protected readonly contact = this.store.selectContactById(this.contactId);
  protected readonly loading = this.store.selectLoadingById(this.contactId);
  protected readonly error = this.store.selectError;
  protected readonly relatedDeals = this.store.selectRelatedDeals(this.contactId);
  protected readonly relatedDealsLoading = this.store.selectRelatedDealsLoading(this.contactId);

  constructor() {
    this.store.loadContact(this.contactId);
    this.store.loadRelatedDeals(this.contactId);
  }

  protected back(): void {
    history.back();
  }
}
