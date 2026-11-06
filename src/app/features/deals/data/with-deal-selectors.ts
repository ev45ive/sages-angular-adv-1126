import { computed } from '@angular/core';
import { signalStoreFeature, type, withMethods } from '@ngrx/signals';
import { EntityProps, EntityState } from '@ngrx/signals/entities';
import { Deal } from '../model/deal.model';

/**
 * Store feature with read-only selectors for deals.
 * - **What:** `computed` signals derived from the normalized entity map. Each selector takes a getter (a signal or arrow function) and returns a signal, so it stays reactive to the caller's input.
 * - **Why:** a deal exists once in the map, so an edit reaches every view (list, details, a contact's deals) with no copies to sync. `type<EntityState<Deal>>()` makes it compose only onto an entity store.
 * - **Use when:** a screen needs another view of the same deals.
 */
export function withDealSelectors() {
  return signalStoreFeature(
    { state: type<EntityState<Deal>>(), props: type<EntityProps<Deal>>() },
    withMethods((store) => ({
      selectDealById(id: () => string | undefined) {
        return computed((): Deal | undefined => {
          const key = id();
          return key === undefined ? undefined : store.entityMap()[key];
        });
      },

      selectFilteredDeals(query: () => string | undefined) {
        return computed(() => {
          const text = (query() ?? '').trim().toLowerCase();
          const deals = store.entities();
          return text ? deals.filter((deal) => deal.title.toLowerCase().includes(text)) : deals;
        });
      },

      selectDealsByContactId(contactId: () => string | undefined) {
        return computed(() => {
          const key = contactId();
          return key === undefined ? [] : store.entities().filter((deal) => deal.contactId === key);
        });
      },
    })),
  );
}
