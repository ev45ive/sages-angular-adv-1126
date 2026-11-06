import { computed } from '@angular/core';
import { signalStoreFeature, type, withMethods } from '@ngrx/signals';
import { EntityProps, EntityState } from '@ngrx/signals/entities';
import { Deal } from '../model/deal.model';

// Selectors read the normalized entity map, so any entity change reaches every selector
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
