import { inject } from '@angular/core';
import { signalStoreFeature, withMethods, withProps } from '@ngrx/signals';
import { DEALS_BY_CONTACT } from '@feature/deals';

/**
 * Store feature exposing a contact's deals.
 * - **What:** adapts the deals public port (`DEALS_BY_CONTACT`) into contact-shaped selectors; `_deals` is a private prop, invisible outside the store.
 * - **Why:** `ContactsStore` knows nothing about deals internals, and the only coupling is the token exported by `@feature/deals`.
 * - **Use when:** a contacts screen shows data owned by another feature: follow this pattern (consume its port, re-expose what the screen needs).
 */
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
