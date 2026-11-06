import { computed, effect, inject, signal, untracked } from '@angular/core';
import { CONTACT_DIRECTORY } from './contact-directory.port';

// State for a contact picker: options for the typed query, plus the label of the selected contact
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
    // Before the search answers, the selected contact keeps its label visible
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
