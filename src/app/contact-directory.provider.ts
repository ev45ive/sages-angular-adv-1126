import { computed, inject, InjectionToken, Injector, Provider, signal } from '@angular/core';
import type { ContactDirectory } from '@feature/deals';

const NO_OPTIONS = Object.freeze({});

// Deals must not import contacts, so the app wires them. The contacts chunk loads on first use.
function lazyContactDirectory(): ContactDirectory {
  const injector = inject(Injector);
  const loaded = signal<ContactDirectory | undefined>(undefined);

  const ready = import('@feature/contacts').then(({ ContactDirectoryAdapter }) => {
    const directory = injector.get(ContactDirectoryAdapter);
    loaded.set(directory);
    return directory;
  });

  return {
    optionsById: computed(() => loaded()?.optionsById() ?? NO_OPTIONS),
    searchResults: computed(() => loaded()?.searchResults() ?? NO_OPTIONS),
    // Counts as loading until the chunk is there
    loading: computed(() => loaded()?.loading() ?? true),
    // Chained on one promise, so calls made before the chunk loads keep their order
    search: (query) => void ready.then((directory) => directory.search(query)),
    load: (id) => void ready.then((directory) => directory.load(id)),
  };
}

// The token arrives as an argument: importing it statically would pull the deals feature into the main bundle
export function provideContactDirectory(token: InjectionToken<ContactDirectory>): Provider {
  return { provide: token, useFactory: lazyContactDirectory };
}
