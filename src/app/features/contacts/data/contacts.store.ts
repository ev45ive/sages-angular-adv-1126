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

/**
 * Cache keys of this store's loaders.
 * - **Why:** hierarchical names let `cacheInvalidate` target a family of queries by prefix.
 */
export const contactsCacheKey = {
  search: (query: string) => `contacts:search:${query}`,
  byId: (id: string) => `contact:${id}`,
};

/**
 * Result list of one search query.
 * - **What:** contact ids and the server's total, not the contacts themselves.
 * - **Why:** entities live once in the entity map, so an edited contact also changes in every earlier search result.
 */
export interface SearchResult {
  ids: string[];
  total: number;
}

/**
 * Extra store state next to the entities.
 * - **What:** `searchByQuery` keeps one `SearchResult` per query string.
 * - **Why:** the server matches by name, email and company, which the client cannot replay, so lists are stored per query.
 */
interface ContactsState {
  searchByQuery: Record<string, SearchResult>;
}

/**
 * Curried state updater: stores the result list of one query.
 * - **Why:** a named transition; results of other queries are kept, so overlapping searches never overwrite each other.
 */
export const setSearchResult =
  (query: string, result: SearchResult): PartialStateUpdater<ContactsState> =>
  (state) => ({ searchByQuery: { ...state.searchByQuery, [query]: result } });

/**
 * Root-scoped signal store holding every `Contact` the app has seen.
 * - **What:** normalized entities, per-query search result lists, loading state, a TTL cache, and related-deals selectors from `withRelatedDeals()`.
 * - **Why root scope:** search and details pages share one cache, and the deals feature reaches it through the directory adapter.
 * - **Use when:** adding contact behaviour; pages call it directly (it is this feature's own store, no port needed).
 */
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

    /**
     * Contacts of a finished search, in server order.
     * - **What:** derived from the id list and the entity map; `query` must already be trimmed, like the argument of `search`.
     */
    selectSearchResults: (query: () => string) =>
      computed(() => {
        const result: SearchResult | undefined = store.searchByQuery()[query()];
        const contacts = store.entityMap();
        return (result?.ids ?? []).map((id) => contacts[id]);
      }),

    /**
     * Whether a query has an answer yet.
     * - **Why:** separates "no results" from "not loaded yet", so the empty state does not flash before the response.
     */
    selectSearched: (query: () => string) => computed(() => query() in store.searchByQuery()),

    selectSearchLoading: (query: () => string) =>
      store.selectLoadingById(() => contactsCacheKey.search(query())),

    /**
     * Search loader (`rxMethod`).
     * - **Why `mergeMap`:** results are stored per query, so overlapping searches (page and contact picker) cannot overwrite or cancel each other.
     */
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
