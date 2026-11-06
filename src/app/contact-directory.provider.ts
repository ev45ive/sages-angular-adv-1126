import { computed, inject, InjectionToken, Injector, Provider, signal } from '@angular/core';
import type { ContactDirectory } from '@feature/deals';

const NO_OPTIONS = Object.freeze({});

/**
 * Lazy `ContactDirectory` implementation.
 * - **What:** a facade that dynamically imports the contacts feature on first use and delegates to its adapter. Signals are empty and `loading` is true until then; commands are queued in order.
 * - **Why:** the app root is the only layer allowed to know both features, so it connects deals to contacts without a cycle or loading contacts eagerly.
 */
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
    loading: computed(() => loaded()?.loading() ?? true),
    search: (query) => void ready.then((directory) => directory.search(query)),
    load: (id) => void ready.then((directory) => directory.load(id)),
  };
}

/**
 * Provider for the contact directory token.
 * - **What:** takes the token as an argument instead of importing it.
 * - **Why:** a static import of `@feature/deals` here would pull the whole deals feature into the main bundle; the route passes the token it got from the lazy module.
 * - **Use when:** declared in `providers` of the lazy deals route in `app.routes.ts`.
 */
export function provideContactDirectory(token: InjectionToken<ContactDirectory>): Provider {
  return { provide: token, useFactory: lazyContactDirectory };
}
