import { computed, inject, Service } from '@angular/core';
import { ContactDirectory, ContactOption } from '@feature/deals';
import { Contact, contactFullName } from '../model/contact.model';
import { ContactsStore } from './contacts.store';

function toOption(contact: Contact): ContactOption {
  return {
    id: contact.id,
    label: contactFullName(contact),
    description: contact.company || contact.email,
  };
}

// Adapts the contacts store to the lookup port that the deals feature defines
@Service()
export class ContactDirectoryAdapter implements ContactDirectory {
  private readonly store = inject(ContactsStore);

  readonly optionsById = computed(() =>
    Object.fromEntries(this.store.entities().map((contact) => [contact.id, toOption(contact)])),
  );

  readonly searchResults = computed(() => {
    const contacts = this.store.entityMap();
    return Object.fromEntries(
      Object.entries(this.store.searchByQuery()).map(([query, result]) => [
        query,
        result.ids.map((id) => toOption(contacts[id])),
      ]),
    );
  });

  readonly loading = this.store.selectLoading;

  search(query: string): void {
    this.store.search(query);
  }

  load(id: string): void {
    this.store.loadContact(id);
  }
}
