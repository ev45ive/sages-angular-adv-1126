import { computed, effect, inject, signal, untracked } from '@angular/core';
import { CONTACT_DIRECTORY } from './contact-directory.port';

/**
 * `inject*` helper (call it in an injection context, like a field initializer) returning picker state.
 * - **What:** the label of the selected contact plus the options for the query typed so far, built on `CONTACT_DIRECTORY`.
 * - **Why:** details, edit and create pages share this logic once and never see the directory's raw maps.
 * - **Why fallback:** options include the selected contact until search results arrive, so its label never goes blank.
 * - **Use when:** a page renders `ContactPicker` or needs a contact's name from its id.
 */
export function injectContactLookup(selectedId: () => string | undefined) {
  const directory = inject(CONTACT_DIRECTORY);
  const query = signal('');

  const selected = computed(() => {
    const id = selectedId();
    return id ? directory.optionsById()[id] : undefined;
  });

  effect(() => {
    const id = selectedId();
    if (id) untracked(() => directory.load(id));
  });

  return {
    label: computed(() => selected()?.label),
    loading: directory.loading,
    options: computed(() => {
      const found = directory.searchResults()[query()];
      if (found) return found;
      const current = selected();
      return current ? [current] : [];
    }),
    search(text: string): void {
      query.set(text);
      directory.search(text);
    },
  };
}
