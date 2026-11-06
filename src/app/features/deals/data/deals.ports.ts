import { inject, InjectionToken, Signal } from '@angular/core';
import type { RxMethod } from '@ngrx/signals/rxjs-interop';
import { Deal } from '../model/deal.model';
import { DealTask } from '../model/deal-task.model';
import { DealsStore, CreateDealCommand, UpdateDealCommand } from './deals.store';
import { CreateTaskCommand, DeleteTaskCommand, TasksStore, UpdateTaskCommand } from './tasks.store';

// Each page injects only the slice of the store it needs.

type Selector<T> = (id: () => string | undefined) => Signal<T>;

export interface DealListSource {
  readonly selectLoading: Signal<boolean>;
  readonly selectError: Signal<string | null>;
  selectFilteredDeals(query: () => string | undefined): Signal<Deal[]>;
  readonly loadDeals: RxMethod<void>;
}

export interface DealDetailsSource {
  readonly selectError: Signal<string | null>;
  readonly selectDealById: Selector<Deal | undefined>;
  readonly selectLoadingById: Selector<boolean>;
  readonly selectRevalidating: Selector<boolean>;
  readonly loadDeal: RxMethod<string | undefined>;
}

export interface DealEditSource {
  readonly selectError: Signal<string | null>;
  readonly selectDealById: Selector<Deal | undefined>;
  readonly selectLoadingById: Selector<boolean>;
  readonly loadDeal: RxMethod<string | undefined>;
  readonly updateDeal: RxMethod<UpdateDealCommand>;
}

export interface DealCreateSource {
  readonly selectError: Signal<string | null>;
  readonly selectLoadingById: Selector<boolean>;
  readonly createDeal: RxMethod<CreateDealCommand>;
}

// Public: other features read a contact's deals through this port
export interface DealsByContactSource {
  readonly selectDealsByContactId: Selector<Deal[]>;
  readonly selectLoadingByContactId: Selector<boolean>;
  readonly selectRevalidatingByContactId: Selector<boolean>;
  readonly loadDealsByContact: RxMethod<string | undefined>;
}

export interface TasksReader {
  readonly selectError: Signal<string | null>;
  readonly selectTasksByDealId: Selector<DealTask[]>;
  readonly selectLoadingById: Selector<boolean>;
}

export interface TasksCommands {
  readonly loadTasksForDeal: RxMethod<string | undefined>;
  readonly createTask: RxMethod<CreateTaskCommand>;
  readonly updateTask: RxMethod<UpdateTaskCommand>;
  readonly deleteTask: RxMethod<DeleteTaskCommand>;
}

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
