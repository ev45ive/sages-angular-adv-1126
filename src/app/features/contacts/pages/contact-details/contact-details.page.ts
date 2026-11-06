import { Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { SharedForms } from '@shared';
import { ContactsStore } from '../../data/contacts.store';
import { Contact } from '../../model/contact.model';
import { ContactFullDetailsCard } from '../../ui/contact-full-details-card/contact-full-details-card';

@Component({
  selector: 'app-contact-details-page',
  imports: [...SharedForms, ContactFullDetailsCard],
  template: `
    <main class="flex flex-col gap-4 bg-surface p-4 text-on-surface">
      <div>
        <button matButton="text" type="button" (click)="back()">Back to search</button>
      </div>

      @if (contactResource.isLoading()) {
        <p class="text-body-md">Loading ...</p>
      }

      @if (errorMessage(); as message) {
        <p role="alert" class="text-body-md text-error">{{ message }}</p>
      }

      @if (contactResource.value(); as contact) {
        <app-contact-full-details-card [contact]="contact" />
      }
    </main>
  `,
})
export class ContactDetailsPage {
  private readonly store = inject(ContactsStore);

  // Bound from the :contactId route param (withComponentInputBinding)
  readonly contactId = input.required<string>();

  protected readonly contactResource = rxResource<Contact, string>({
    params: () => this.contactId(),
    stream: ({ params: id }) => this.store.getById(id),
  });

  protected readonly errorMessage = computed(() => {
    const error = this.contactResource.error();
    if (!error) return null;
    return error instanceof Error ? error.message : 'Unexpected error';
  });

  protected back(): void {
    history.back();
  }
}
