import { computed, inject } from '@angular/core';
import {
  PartialStateUpdater,
  patchState,
  signalStore,
  withMethods,
  withState,
} from '@ngrx/signals';
import { upsertEntities, upsertEntity, withEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { withLoadingState, withStaleWhileRevalidate } from '@shared';
import { filter, mergeMap, pipe } from 'rxjs';
import { Contact } from '../model/contact.model';
import { ContactsApi } from './contacts-api';
import { withRelatedDeals } from './with-related-deals';

const TTL_MS = 60_000;

export const contactsCacheKey = {
  search: (query: string) => `contacts:search:${query}`,
  byId: (id: string) => `contact:${id}`,
};

export interface SearchResult {
  ids: string[];
  total: number;
}

interface ContactsState {
  // Server-side matching cannot be repeated on the client, so each query keeps its own id list
  searchByQuery: Record<string, SearchResult>;
}

export const setSearchResult =
  (query: string, result: SearchResult): PartialStateUpdater<ContactsState> =>
  (state) => ({ searchByQuery: { ...state.searchByQuery, [query]: result } });

export const ContactsStore = signalStore(
  { providedIn: 'root' },
  withEntities<Contact>(),
  withState<ContactsState>({ searchByQuery: {} }),
  withLoadingState(),
  withStaleWhileRevalidate({ ttlMs: TTL_MS }),
  withRelatedDeals(),

  withMethods((store, api = inject(ContactsApi)) => ({
    selectContactById: (id: () => string | undefined) =>
      computed((): Contact | undefined => {
        const key = id();
        return key === undefined ? undefined : store.entityMap()[key];
      }),

    // `query` must be trimmed, as it is when passed to search()
    selectSearchResults: (query: () => string) =>
      computed(() => {
        const result: SearchResult | undefined = store.searchByQuery()[query()];
        const contacts = store.entityMap();
        return (result?.ids ?? []).map((id) => contacts[id]);
      }),

    // True once the query has an answer, so "no results" is not shown before it arrives
    selectSearched: (query: () => string) => computed(() => query() in store.searchByQuery()),

    selectSearchLoading: (query: () => string) =>
      store.selectLoadingById(() => contactsCacheKey.search(query())),

    // Results are stored per query, so overlapping searches cannot overwrite each other
    search: rxMethod<string>(
      pipe(
        mergeMap((query) =>
          store._swr({
            key: contactsCacheKey.search(query),
            source: () => api.search(query),
            onData: (page) =>
              patchState(
                store,
                upsertEntities(page.items),
                setSearchResult(query, { ids: page.items.map((c) => c.id), total: page.total }),
              ),
          }),
        ),
      ),
    ),

    loadContact: rxMethod<string | undefined>(
      pipe(
        filter((id): id is string => id !== undefined),
        mergeMap((id) =>
          store._swr({
            key: contactsCacheKey.byId(id),
            loadingId: id,
            source: () => api.getById(id),
            onData: (contact) => patchState(store, upsertEntity(contact)),
          }),
        ),
      ),
    ),
  })),
);
