import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Deal, DealChanges, DealDraft } from '../model/deal.model';
import {
  DealDto,
  PagedDto,
  toDeal,
  toDealCreateRequest,
  toDealUpdateRequest,
} from './deals.mappers';

/**
 * HTTP gateway for deals.
 * - **What:** the only class that calls `/deals`; returns client-model objects, never DTOs.
 * - **Why:** Sheriff forbids `features -> core`, so API access is feature-local; stores depend on it and specs replace it with a fake.
 */
@Service()
export class DealsApi {
  private readonly http = inject(HttpClient);

  list(filter: { contactId?: string } = {}): Observable<Deal[]> {
    const params: Record<string, string> = filter.contactId ? { contactId: filter.contactId } : {};
    return this.http
      .get<PagedDto<DealDto>>('deals', { params })
      .pipe(map((page) => page.items.map(toDeal)));
  }

  getById(id: string): Observable<Deal> {
    return this.http.get<DealDto>(`deals/${encodeURIComponent(id)}`).pipe(map(toDeal));
  }

  create(draft: DealDraft): Observable<Deal> {
    return this.http.post<DealDto>('deals', toDealCreateRequest(draft)).pipe(map(toDeal));
  }

  update(id: string, changes: DealChanges): Observable<Deal> {
    return this.http
      .put<DealDto>(`deals/${encodeURIComponent(id)}`, toDealUpdateRequest(changes))
      .pipe(map(toDeal));
  }
}
