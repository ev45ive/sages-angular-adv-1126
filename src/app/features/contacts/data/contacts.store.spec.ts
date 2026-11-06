import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Deal, DEALS_BY_CONTACT, DealsByContactSource } from '@feature/deals';
import { of } from 'rxjs';
import { Contact } from '../model/contact.model';
import { ContactsApi } from './contacts-api';
import { ContactsStore } from './contacts.store';

function makeContact(overrides: Partial<Contact> = {}): Contact {
  return {
    id: 'c1',
    firstName: 'Anna',
    lastName: 'Kowalska',
    email: 'anna@example.com',
    status: 'customer',
    createdAt: '2025-06-15T10:30:00Z',
    company: 'Tech Solutions',
    ...overrides,
  };
}

function makeDeal(overrides: Partial<Deal> = {}): Deal {
  return {
    id: 'd1',
    title: 'Enterprise License',
    summary: '',
    stage: 'new',
    value: { amount: 1000, currency: 'USD' },
    contactId: 'c1',
    isPublic: false,
    ...overrides,
  };
}

describe('ContactsStore', () => {
  const api = { search: vi.fn(), getById: vi.fn() };
  const deals = signal<Deal[]>([]);
  const loadDealsByContact = vi.fn();

  const dealsPort = {
    selectDealsByContactId: (contactId: () => string | undefined) =>
      computed(() => deals().filter((deal) => deal.contactId === contactId())),
    selectLoadingByContactId: () => computed(() => false),
    selectRevalidatingByContactId: () => computed(() => false),
    loadDealsByContact,
  } as unknown as DealsByContactSource;

  beforeEach(() => {
    deals.set([]);
    api.search.mockReset().mockImplementation((q: string) =>
      of({
        items: q === 'ann' ? [makeContact()] : [makeContact({ id: 'c2', firstName: 'Marek' })],
        total: 1,
        offset: 0,
        limit: 20,
      }),
    );
    api.getById.mockReset().mockReturnValue(of(makeContact({ company: 'New Company' })));
    TestBed.configureTestingModule({
      providers: [
        { provide: ContactsApi, useValue: api },
        { provide: DEALS_BY_CONTACT, useValue: dealsPort },
      ],
    });
  });

  it('keeps the result list of every query, so overlapping searches do not overwrite each other', () => {
    const store = TestBed.inject(ContactsStore);

    store.search('ann');
    store.search('mar');

    expect(
      store
        .selectSearchResults(() => 'ann')()
        .map((c) => c.id),
    ).toEqual(['c1']);
    expect(
      store
        .selectSearchResults(() => 'mar')()
        .map((c) => c.id),
    ).toEqual(['c2']);
  });

  it('reports a query as searched only after its response arrived', () => {
    const store = TestBed.inject(ContactsStore);
    const searched = store.selectSearched(() => 'ann');

    expect(searched()).toBe(false);
    store.search('ann');
    expect(searched()).toBe(true);
  });

  it('reflects a reloaded contact in earlier search results', () => {
    const store = TestBed.inject(ContactsStore);
    store.search('ann');
    const results = store.selectSearchResults(() => 'ann');
    expect(results()[0].company).toBe('Tech Solutions');

    store.loadContact('c1');

    expect(results()[0].company).toBe('New Company');
    expect(store.selectContactById(() => 'c1')()?.company).toBe('New Company');
  });

  it('does not fetch a query again while it is fresh', () => {
    const store = TestBed.inject(ContactsStore);

    store.search('ann');
    store.search('ann');

    expect(api.search).toHaveBeenCalledTimes(1);
  });

  it('follows deal changes of the related deals port', () => {
    const store = TestBed.inject(ContactsStore);
    const related = store.selectRelatedDeals(() => 'c1');
    expect(related()).toEqual([]);

    deals.set([makeDeal(), makeDeal({ id: 'd2', contactId: 'c2' })]);
    expect(related().map((deal) => deal.id)).toEqual(['d1']);

    deals.update((list) => list.map((deal) => ({ ...deal, stage: 'closed-won' as const })));
    expect(related()[0].stage).toBe('closed-won');

    store.loadRelatedDeals('c1');
    expect(loadDealsByContact).toHaveBeenCalledWith('c1');
  });
});
