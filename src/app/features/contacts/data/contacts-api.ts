import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Contact, ContactSearchResponse, PagedContacts } from '../model/contact.model';

/**
 * HTTP gateway for contacts.
 * - **What:** the only class that calls `/contacts`; unwraps the server's `{ contacts: page }` envelope.
 * - **Why:** feature-local (features cannot import `core`), and replaceable in specs.
 */
@Service()
export class ContactsApi {
  private readonly http = inject(HttpClient);

  search(q: string): Observable<PagedContacts> {
    return this.http
      .get<ContactSearchResponse>('contacts', { params: { q } })
      .pipe(map((response) => response.contacts));
  }

  getById(contactId: string): Observable<Contact> {
    return this.http.get<Contact>(`contacts/${encodeURIComponent(contactId)}`);
  }
}
