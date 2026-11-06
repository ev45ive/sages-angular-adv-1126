import { computed } from '@angular/core';
import { signalStoreFeature, type, withMethods } from '@ngrx/signals';
import { EntityProps, EntityState } from '@ngrx/signals/entities';
import { DealTask } from '../model/deal-task.model';

/**
 * Store feature with read-only selectors for tasks.
 * - **What:** same pattern as `withDealSelectors`: getter in, computed signal out, derived from the entity map.
 * - **Why:** ordering (open tasks first) is a view concern, so it lives in the selector, not in stored state.
 */
export function withTaskSelectors() {
  return signalStoreFeature(
    { state: type<EntityState<DealTask>>(), props: type<EntityProps<DealTask>>() },
    withMethods((store) => ({
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
