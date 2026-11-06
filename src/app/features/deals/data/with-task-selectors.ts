import { computed } from '@angular/core';
import { signalStoreFeature, type, withMethods } from '@ngrx/signals';
import { EntityProps, EntityState } from '@ngrx/signals/entities';
import { DealTask } from '../model/deal-task.model';

export function withTaskSelectors() {
  return signalStoreFeature(
    { state: type<EntityState<DealTask>>(), props: type<EntityProps<DealTask>>() },
    withMethods((store) => ({
      // Open tasks first; the sort is stable, so insertion order is kept inside each group
      selectTasksByDealId(dealId: () => string | undefined) {
        return computed(() => {
          const key = dealId();
          if (key === undefined) return [];
          return store
            .entities()
            .filter((task) => task.dealId === key)
            .sort((a, b) => Number(a.done) - Number(b.done));
        });
      },
    })),
  );
}
