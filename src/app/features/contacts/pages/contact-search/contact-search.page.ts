import { Component, computed, inject, input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ContactsStore } from '../../data/contacts.store';
import { ContactCard } from '../../ui/contact-card/contact-card';
import { ContactSearchForm } from '../../ui/contact-search-form/contact-search-form';

@Component({
  selector: 'app-contact-search-page',
  imports: [ContactCard, ContactSearchForm],
  template: `
    <main class="flex flex-col gap-4 bg-surface p-4 text-on-surface">
      <h1 class="text-title-lg">Contacts</h1>

      <app-contact-search-form [initialQuery]="query()" (queryChange)="onQueryChange($event)" />

      @if (loading()) {
        <p class="text-body-md">Loading ...</p>
      }

      @if (error(); as message) {
        <p role="alert" class="text-body-md text-error">{{ message }}</p>
      }

      @if (searched() && contacts().length === 0) {
        <p class="text-body-md text-on-surface-variant">No contacts found.</p>
      }

      <ul class="grid grid-cols-1 gap-4 md:grid-cols-2">
        @for (contact of contacts(); track contact.id) {
          <li>
            <app-contact-card [contact]="contact" />
          </li>
        }
      </ul>
    </main>
  `,
})
export class ContactSearchPage {
  private readonly store = inject(ContactsStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Bound from the ?q= query param (withComponentInputBinding)
  readonly q = input<string>();

  protected readonly query = computed(() => (this.q() ?? '').trim());
  protected readonly contacts = this.store.selectSearchResults(this.query);
  protected readonly searched = this.store.selectSearched(this.query);
  protected readonly loading = this.store.selectSearchLoading(this.query);
  protected readonly error = this.store.selectError;

  constructor() {
    this.store.search(this.query);
  }

  // Keeps the search term in the URL; replaceUrl avoids a history entry per keystroke
  protected onQueryChange(q: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q },
      replaceUrl: true,
    });
  }
}
