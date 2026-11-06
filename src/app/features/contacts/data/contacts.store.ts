import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Contact, ContactSearchResponse, PagedContacts } from '../model/contact.model';

@Service()
export class ContactsStore {
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
