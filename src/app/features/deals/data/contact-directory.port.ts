import { InjectionToken, Signal } from '@angular/core';

/**
 * Minimal contact shape the deals feature works with.
 * - **What:** id, display label and an optional secondary line.
 * - **Why:** deals needs a name to show and a choice to pick, not the contacts domain model.
 */
export interface ContactOption {
  id: string;
  label: string;
  description?: string;
}

/**
 * Port: the contact lookup the deals feature depends on.
 * - **What:** data signals plus plain-value commands; the implementation is the contacts store behind an adapter.
 * - **Why:** deals must not import the contacts feature (contacts already imports deals), so deals owns this interface and the app wires the implementation (`app.routes.ts`).
 * - **Why plain commands:** the implementation loads lazily, so commands may run before it exists and are queued.
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

/**
 * DI token of the contact directory.
 * - **What:** deliberately has no default provider.
 * - **Why:** the app provides it on the deals route; forgetting to do so fails loudly at injection time.
 */
export const CONTACT_DIRECTORY = new InjectionToken<ContactDirectory>('CONTACT_DIRECTORY');
