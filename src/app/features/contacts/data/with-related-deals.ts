import { inject } from '@angular/core';
import { signalStoreFeature, withMethods, withProps } from '@ngrx/signals';
import { DEALS_BY_CONTACT } from '@feature/deals';

// Reads and loads a contact's deals through the deals public port
export function withRelatedDeals() {
  return signalStoreFeature(
    withProps(() => ({ _deals: inject(DEALS_BY_CONTACT) })),
    withMethods((store) => ({
      selectRelatedDeals: (contactId: () => string | undefined) =>
        store._deals.selectDealsByContactId(contactId),

      selectRelatedDealsLoading: (contactId: () => string | undefined) =>
        store._deals.selectLoadingByContactId(contactId),

      loadRelatedDeals: store._deals.loadDealsByContact,
    })),
  );
}
