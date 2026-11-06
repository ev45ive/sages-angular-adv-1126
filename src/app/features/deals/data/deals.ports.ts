import { inject, InjectionToken, Signal } from '@angular/core';
import type { RxMethod } from '@ngrx/signals/rxjs-interop';
import { Deal } from '../model/deal.model';
import { DealTask } from '../model/deal-task.model';
import { DealsStore, CreateDealCommand, UpdateDealCommand } from './deals.store';
import { CreateTaskCommand, DeleteTaskCommand, TasksStore, UpdateTaskCommand } from './tasks.store';

/**
 * Shape of a parameterised selector in the ports.
 * - **What:** takes an id *getter* (signal or arrow function) and returns a computed signal.
 * - **Why:** callers pass a route-bound input signal and the result stays reactive to it.
 */
type Selector<T> = (id: () => string | undefined) => Signal<T>;

/**
 * Port of the deals list (layout page).
 * - **What:** a port is an interface exposing a narrow slice of a store, paired with an `InjectionToken` whose factory returns the root store instance.
 * - **Why:** a page can only call what it needs (the types hide the rest) and specs fake it with one provider. TypeScript narrows it; the runtime object is still the full store.
 * - **Use when:** a page needs store access: add the member to the smallest port, never inject `DealsStore` directly.
 */
export interface DealListSource {
  readonly listLoading: Signal<boolean>;
  readonly selectError: Signal<string | null>;
  selectFilteredDeals(query: () => string | undefined): Signal<Deal[]>;
  readonly loadDeals: RxMethod<void>;
}

/**
 * Port of the deal details page.
 * - **Why:** read-only plus `loadDeal`; the page cannot update or create deals.
 */
export interface DealDetailsSource {
  readonly selectDealById: Selector<Deal | undefined>;
  readonly selectLoadingById: Selector<boolean>;
  readonly selectRevalidating: Selector<boolean>;
  readonly loadDeal: RxMethod<string | undefined>;
}

/**
 * Port of the deal edit page.
 * - **Why:** adds `updateDeal` to the read slice; creation is a separate port.
 */
export interface DealEditSource {
  readonly selectDealById: Selector<Deal | undefined>;
  readonly selectLoadingById: Selector<boolean>;
  readonly loadDeal: RxMethod<string | undefined>;
  readonly updateDeal: RxMethod<UpdateDealCommand>;
}

/**
 * Port of the deal create page.
 * - **Why:** a new deal has no id yet, so it exposes a `creating` flag instead of id-based selectors.
 */
export interface DealCreateSource {
  readonly creating: Signal<boolean>;
  readonly createDeal: RxMethod<CreateDealCommand>;
}

/**
 * Public port: how other features read a contact's deals.
 * - **What:** exported from `@feature/deals`; the contacts feature injects it via `DEALS_BY_CONTACT`.
 * - **Why:** the only sanctioned coupling from contacts to deals (features import each other only through `index.ts`), and it hides the store's cache keys.
 */
export interface DealsByContactSource {
  readonly selectDealsByContactId: Selector<Deal[]>;
  readonly selectLoadingByContactId: Selector<boolean>;
  readonly selectRevalidatingByContactId: Selector<boolean>;
  readonly loadDealsByContact: RxMethod<string | undefined>;
}

/**
 * Port: task selectors (read side).
 * - **Why:** split from `TasksCommands` so a read-only view cannot mutate tasks.
 */
export interface TasksReader {
  readonly selectError: Signal<string | null>;
  readonly selectTasksByDealId: Selector<DealTask[]>;
  readonly selectLoadingById: Selector<boolean>;
}

/**
 * Port: task loading and mutations (write side).
 * - **Why:** the tasks page is the only consumer that may change tasks.
 */
export interface TasksCommands {
  readonly loadTasksForDeal: RxMethod<string | undefined>;
  readonly createTask: RxMethod<CreateTaskCommand>;
  readonly updateTask: RxMethod<UpdateTaskCommand>;
  readonly deleteTask: RxMethod<DeleteTaskCommand>;
}

/**
 * Port tokens (same pattern for all below).
 * - **What:** `providedIn: 'root'` with a factory returning the store, so no route needs to provide them.
 * - **Why:** specs override a token with `useValue` to test a page against a fake port.
 */
export const DEAL_LIST_SOURCE = new InjectionToken<DealListSource>('DEAL_LIST_SOURCE', {
  providedIn: 'root',
  factory: () => inject(DealsStore),
});

export const DEAL_DETAILS_SOURCE = new InjectionToken<DealDetailsSource>('DEAL_DETAILS_SOURCE', {
  providedIn: 'root',
  factory: () => inject(DealsStore),
});

export const DEAL_EDIT_SOURCE = new InjectionToken<DealEditSource>('DEAL_EDIT_SOURCE', {
  providedIn: 'root',
  factory: () => inject(DealsStore),
});

export const DEAL_CREATE_SOURCE = new InjectionToken<DealCreateSource>('DEAL_CREATE_SOURCE', {
  providedIn: 'root',
  factory: () => inject(DealsStore),
});

export const DEALS_BY_CONTACT = new InjectionToken<DealsByContactSource>('DEALS_BY_CONTACT', {
  providedIn: 'root',
  factory: () => inject(DealsStore),
});

export const TASKS_READER = new InjectionToken<TasksReader>('TASKS_READER', {
  providedIn: 'root',
  factory: () => inject(TasksStore),
});

export const TASKS_COMMANDS = new InjectionToken<TasksCommands>('TASKS_COMMANDS', {
  providedIn: 'root',
  factory: () => inject(TasksStore),
});
