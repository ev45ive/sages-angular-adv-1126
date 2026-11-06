import { computed, inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withComputed, withMethods } from '@ngrx/signals';
import {
  addEntity,
  setEntity,
  updateEntity,
  upsertEntities,
  upsertEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  cacheInvalidate,
  loadingError,
  loadingFinish,
  loadingStart,
  withLoadingState,
  withStaleWhileRevalidate,
} from '@shared';
import { debounceTime, exhaustMap, filter, groupBy, mergeMap, pipe, switchMap } from 'rxjs';
import { Deal, DealChanges, DealDraft } from '../model/deal.model';
import { DealsApi } from './deals-api';
import { withDealSelectors } from './with-deal-selectors';

const TTL_MS = 60_000;

/**
 * Debounce window of Save/Create.
 * - **Why:** repeated clicks inside it collapse into one request.
 */
const SAVE_DEBOUNCE_MS = 300;

/**
 * Loading id of the in-flight `createDeal` request.
 * - **Why:** a new deal has no entity id yet, so the spinner needs a fixed key.
 */
export const NEW_DEAL_ID = 'new-deal';

/**
 * Cache keys of this store's loaders.
 * - **What:** hierarchical names (`deals:byContact:<id>`).
 * - **Why:** `cacheInvalidate` works by prefix, so mutations can mark whole families of queries stale.
 */
export const dealsCacheKey = {
  list: 'deals:list',
  byContact: (contactId: string) => `deals:byContact:${contactId}`,
  byId: (id: string) => `deal:${id}`,
};

/**
 * Input of `createDeal`.
 * - **What:** one object, because `rxMethod` accepts a single argument; `onCreated` is an optional success callback.
 * - **Why:** the page navigates after success without the store knowing about the router.
 */
export interface CreateDealCommand {
  draft: DealDraft;
  onCreated?: (deal: Deal) => void;
}

/**
 * Input of `updateDeal`.
 * - **What:** same shape idea as `CreateDealCommand`; `changes` may be partial.
 * - **Why:** callers send only what the user changed.
 */
export interface UpdateDealCommand {
  id: string;
  changes: DealChanges;
  onSaved?: (deal: Deal) => void;
}

/**
 * Root-scoped signal store holding every `Deal` the app has seen.
 * - **What:** NgRx Signals store with normalized entities (`entityMap` + `ids`), loading state and a TTL cache. Components never inject it directly; they inject a port from `deals.ports.ts`.
 * - **Why:** one entity per id, so any change (edit, reload) reaches every selector: list, details, a contact's related deals.
 * - **Why root scope:** the cache must outlive routes, and the contacts feature reads it through `DEALS_BY_CONTACT`.
 * - **Use when:** adding deal behaviour: put it here, then expose it through the smallest port that needs it.
 */
export const DealsStore = signalStore(
  { providedIn: 'root' },
  withEntities<Deal>(),
  withLoadingState(),
  withStaleWhileRevalidate({ ttlMs: TTL_MS }),
  withDealSelectors(),
  withComputed(({ inFlightIds }) => ({
    listLoading: computed(() => inFlightIds().includes(dealsCacheKey.list)),
    creating: computed(() => inFlightIds().includes(NEW_DEAL_ID)),
  })),

  withMethods((store, api = inject(DealsApi)) => {
    const upsertDeals = (deals: Deal[]) => patchState(store, upsertEntities(deals));

    return {
      /**
       * Loading flag of one contact's deals query.
       * - **Why:** the cache-key scheme stays private to this store; other features ask by contact id.
       */
      selectLoadingByContactId: (contactId: () => string | undefined) =>
        store.selectLoadingById(() => {
          const id = contactId();
          return id === undefined ? undefined : dealsCacheKey.byContact(id);
        }),

      /**
       * Background-refresh flag of one contact's deals query.
       * - **Use when:** the UI shows cached deals and wants a subtle "refreshing" hint instead of a spinner.
       */
      selectRevalidatingByContactId: (contactId: () => string | undefined) =>
        store.selectRevalidating(() => {
          const id = contactId();
          return id === undefined ? undefined : dealsCacheKey.byContact(id);
        }),

      /**
       * Loader for the whole deal list.
       * - **What:** an `rxMethod`: callable with a value, a signal or an observable, and re-runs when a signal changes.
       * - **Why:** pages hand over their route-bound input signal and get reloads for free, with no manual subscription.
       */
      loadDeals: rxMethod<void>(
        pipe(
          switchMap(() =>
            store._swr({ key: dealsCacheKey.list, source: () => api.list(), onData: upsertDeals }),
          ),
        ),
      ),

      /**
       * Loader for one contact's deals.
       * - **Why:** the contacts feature calls it through `DEALS_BY_CONTACT`; results land in the shared entity map.
       * - `undefined` is ignored, so a not-yet-bound route input is safe to pass.
       */
      loadDealsByContact: rxMethod<string | undefined>(
        pipe(
          filter((contactId): contactId is string => contactId !== undefined),
          switchMap((contactId) =>
            store._swr({
              key: dealsCacheKey.byContact(contactId),
              source: () => api.list({ contactId }),
              onData: upsertDeals,
            }),
          ),
        ),
      ),

      /**
       * Loader for a single deal (details and edit pages).
       * - **Why:** deep links work without the list having been loaded; navigating between deals cancels the previous request.
       */
      loadDeal: rxMethod<string | undefined>(
        pipe(
          filter((id): id is string => id !== undefined),
          switchMap((id) =>
            store._swr({
              key: dealsCacheKey.byId(id),
              loadingId: id,
              source: () => api.getById(id),
              onData: (deal) => patchState(store, upsertEntity(deal)),
            }),
          ),
        ),
      ),

      /**
       * Debounced, non-reentrant create.
       * - **Why:** double-clicking Save must not create two deals: clicks collapse in the debounce window and are ignored while a request runs.
       * - **Why after success:** lists are marked stale so other screens refresh quietly.
       */
      createDeal: rxMethod<CreateDealCommand>(
        pipe(
          debounceTime(SAVE_DEBOUNCE_MS),
          exhaustMap(({ draft, onCreated }) => {
            patchState(store, loadingStart(NEW_DEAL_ID));

            return api.create(draft).pipe(
              tapResponse({
                next: (deal) => {
                  patchState(
                    store,
                    addEntity(deal),
                    cacheInvalidate(dealsCacheKey.list),
                    cacheInvalidate(dealsCacheKey.byContact(deal.contactId)),
                  );
                  onCreated?.(deal);
                },
                error: (error) => patchState(store, loadingError(error)),
                finalize: () => patchState(store, loadingFinish(NEW_DEAL_ID)),
              }),
            );
          }),
        ),
      ),

      /**
       * Optimistic, debounced update, grouped per deal id.
       * - **Why optimistic:** the UI reflects the edit at once; a failed request restores the previous entity.
       * - **Why grouped:** saving two different deals never drops one, while repeated saves of one deal collapse.
       */
      updateDeal: rxMethod<UpdateDealCommand>(
        pipe(
          groupBy((command) => command.id),
          mergeMap((commands$) =>
            commands$.pipe(
              debounceTime(SAVE_DEBOUNCE_MS),
              exhaustMap(({ id, changes, onSaved }) => {
                const original: Deal | undefined = store.entityMap()[id];
                patchState(store, loadingStart(id), updateEntity<Deal>({ id, changes }));

                return api.update(id, changes).pipe(
                  tapResponse({
                    next: (deal) => {
                      patchState(
                        store,
                        upsertEntity(deal),
                        cacheInvalidate(dealsCacheKey.byContact(deal.contactId)),
                      );
                      if (original && original.contactId !== deal.contactId) {
                        patchState(
                          store,
                          cacheInvalidate(dealsCacheKey.byContact(original.contactId)),
                        );
                      }
                      onSaved?.(deal);
                    },
                    error: (error) => {
                      if (original) patchState(store, setEntity(original));
                      patchState(store, loadingError(error));
                    },
                    finalize: () => patchState(store, loadingFinish(id)),
                  }),
                );
              }),
            ),
          ),
        ),
      ),
    };
  }),
);
