import { InjectionToken, Signal } from '@angular/core';

export interface ContactOption {
  id: string;
  label: string;
  description?: string;
}

/**
 * Contact lookup the deals feature needs. Deals must not import the contacts feature,
 * so the app provides the implementation (see app.config.ts).
 * Commands take plain values and may be called before the implementation has loaded.
 */
export interface ContactDirectory {
  // Every contact seen so far, by id
  readonly optionsById: Signal<Readonly<Record<string, ContactOption>>>;
  // Result lists of finished searches, by trimmed query
  readonly searchResults: Signal<Readonly<Record<string, readonly ContactOption[]>>>;
  readonly loading: Signal<boolean>;
  search(query: string): void;
  load(id: string): void;
}

export const CONTACT_DIRECTORY = new InjectionToken<ContactDirectory>('CONTACT_DIRECTORY');
