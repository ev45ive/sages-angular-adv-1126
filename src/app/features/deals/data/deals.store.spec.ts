import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { Deal, DealDraft } from '../model/deal.model';
import { DealsApi } from './deals-api';
import { DealsStore } from './deals.store';

const SAVE_DEBOUNCE_MS = 300;

function makeDraft(overrides: Partial<DealDraft> = {}): DealDraft {
  return {
    title: 'Enterprise License',
    summary: '',
    stage: 'new',
    value: { amount: 1000, currency: 'USD' },
    contactId: 'c1',
    isPublic: false,
    ...overrides,
  };
}

function makeDeal(overrides: Partial<Deal> = {}): Deal {
  return { id: 'd1', ...makeDraft(), ...overrides };
}

describe('DealsStore', () => {
  const api = { list: vi.fn(), getById: vi.fn(), create: vi.fn(), update: vi.fn() };

  beforeEach(() => {
    vi.useFakeTimers();
    api.list
      .mockReset()
      .mockReturnValue(
        of([makeDeal(), makeDeal({ id: 'd2', title: 'Pilot Program', contactId: 'c2' })]),
      );
    TestBed.configureTestingModule({ providers: [{ provide: DealsApi, useValue: api }] });
  });

  afterEach(() => vi.useRealTimers());

  it('selects deals by title and by contact from the entity map', () => {
    const store = TestBed.inject(DealsStore);
    store.loadDeals();

    expect(
      store
        .selectFilteredDeals(() => 'pilot')()
        .map((deal) => deal.id),
    ).toEqual(['d2']);
    expect(
      store
        .selectDealsByContactId(() => 'c1')()
        .map((deal) => deal.id),
    ).toEqual(['d1']);
  });

  it('shows a saved change in every selector, optimistically', () => {
    const response = new Subject<Deal>();
    api.update.mockReturnValue(response);
    const store = TestBed.inject(DealsStore);
    store.loadDeals();

    const byId = store.selectDealById(() => 'd1');
    const byContact = store.selectDealsByContactId(() => 'c1');
    const byTitle = store.selectFilteredDeals(() => 'enterprise');

    store.updateDeal({ id: 'd1', changes: { stage: 'proposal' } });
    vi.advanceTimersByTime(SAVE_DEBOUNCE_MS);

    expect(byId()?.stage).toBe('proposal');
    expect(byContact()[0].stage).toBe('proposal');
    expect(byTitle()[0].stage).toBe('proposal');
    expect(store.selectLoadingById(() => 'd1')()).toBe(true);

    response.next(makeDeal({ stage: 'proposal', title: 'Enterprise (renewed)' }));
    response.complete();

    expect(byId()?.title).toBe('Enterprise (renewed)');
    expect(store.selectLoadingById(() => 'd1')()).toBe(false);
  });

  it('collapses repeated saves of one deal into a single request', () => {
    api.update.mockReturnValue(of(makeDeal({ title: 'Third' })));
    const store = TestBed.inject(DealsStore);
    store.loadDeals();

    store.updateDeal({ id: 'd1', changes: { title: 'First' } });
    store.updateDeal({ id: 'd1', changes: { title: 'Second' } });
    store.updateDeal({ id: 'd1', changes: { title: 'Third' } });
    vi.advanceTimersByTime(SAVE_DEBOUNCE_MS);

    expect(api.update).toHaveBeenCalledTimes(1);
    expect(api.update).toHaveBeenCalledWith('d1', { title: 'Third' });
  });

  it('saves two different deals independently', () => {
    api.update.mockReturnValue(of(makeDeal()));
    const store = TestBed.inject(DealsStore);
    store.loadDeals();

    store.updateDeal({ id: 'd1', changes: { title: 'A' } });
    store.updateDeal({ id: 'd2', changes: { title: 'B' } });
    vi.advanceTimersByTime(SAVE_DEBOUNCE_MS);

    expect(api.update).toHaveBeenCalledTimes(2);
  });

  it('reverts the optimistic change and exposes the error when saving fails', () => {
    const response = new Subject<Deal>();
    api.update.mockReturnValue(response);
    const store = TestBed.inject(DealsStore);
    store.loadDeals();

    store.updateDeal({ id: 'd1', changes: { stage: 'closed-won' } });
    vi.advanceTimersByTime(SAVE_DEBOUNCE_MS);
    expect(store.selectDealById(() => 'd1')()?.stage).toBe('closed-won');

    response.error(new Error('Server down'));

    expect(store.selectDealById(() => 'd1')()?.stage).toBe('new');
    expect(store.selectError()).toBe('Server down');
    expect(store.selectLoadingById(() => 'd1')()).toBe(false);
  });

  it('creates one deal for repeated clicks and reports the created deal', () => {
    const response = new Subject<Deal>();
    api.create.mockReturnValue(response);
    const onCreated = vi.fn();
    const store = TestBed.inject(DealsStore);
    const draft = makeDraft({ title: 'Brand new' });

    store.createDeal({ draft, onCreated });
    store.createDeal({ draft, onCreated });
    vi.advanceTimersByTime(SAVE_DEBOUNCE_MS);

    expect(store.creating()).toBe(true);
    expect(api.create).toHaveBeenCalledTimes(1);

    response.next(makeDeal({ id: 'd9', title: 'Brand new' }));
    response.complete();

    expect(store.creating()).toBe(false);
    expect(onCreated).toHaveBeenCalledWith(expect.objectContaining({ id: 'd9' }));
    expect(store.selectDealById(() => 'd9')()?.title).toBe('Brand new');
  });

  it('refetches the list after a deal was created', () => {
    api.create.mockReturnValue(of(makeDeal({ id: 'd9' })));
    const store = TestBed.inject(DealsStore);
    const draft = makeDraft();

    store.loadDeals();
    store.loadDeals();
    expect(api.list).toHaveBeenCalledTimes(1);

    store.createDeal({ draft });
    vi.advanceTimersByTime(SAVE_DEBOUNCE_MS);
    store.loadDeals();

    expect(api.list).toHaveBeenCalledTimes(2);
    expect(store.selectLoadingById(() => 'deals:list')()).toBe(false);
  });
});
