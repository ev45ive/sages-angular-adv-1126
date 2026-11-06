import { inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withMethods } from '@ngrx/signals';
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
// Collapses repeated Save clicks into one request
const SAVE_DEBOUNCE_MS = 300;

// Loading id of the in-flight createDeal request
export const NEW_DEAL_ID = 'new-deal';

export const dealsCacheKey = {
  list: 'deals:list',
  byContact: (contactId: string) => `deals:byContact:${contactId}`,
  byId: (id: string) => `deal:${id}`,
};

export interface CreateDealCommand {
  draft: DealDraft;
  onCreated?: (deal: Deal) => void;
}

export interface UpdateDealCommand {
  id: string;
  changes: DealChanges;
  onSaved?: (deal: Deal) => void;
}

export const DealsStore = signalStore(
  { providedIn: 'root' },
  withEntities<Deal>(),
  withLoadingState(),
  withStaleWhileRevalidate({ ttlMs: TTL_MS }),
  withDealSelectors(),

  withMethods((store, api = inject(DealsApi)) => {
    const upsertDeals = (deals: Deal[]) => patchState(store, upsertEntities(deals));

    return {
      loadDeals: rxMethod<void>(
        pipe(
          switchMap(() =>
            store._swr({ key: dealsCacheKey.list, source: () => api.list(), onData: upsertDeals }),
          ),
        ),
      ),

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

      createDeal: rxMethod<CreateDealCommand>(
        pipe(
          debounceTime(SAVE_DEBOUNCE_MS),
          // Clicks while a request is running are ignored
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

      // Debounce and exhaust run per deal id, so saving two deals never drops one
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
