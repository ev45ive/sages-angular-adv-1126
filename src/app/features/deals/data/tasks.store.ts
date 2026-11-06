import { inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withMethods } from '@ngrx/signals';
import {
  prependEntity,
  removeEntities,
  removeEntity,
  setEntity,
  updateEntity,
  upsertEntities,
  upsertEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  loadingError,
  loadingFinish,
  loadingStart,
  withLoadingState,
  withStaleWhileRevalidate,
} from '@shared';
import { concatMap, filter, map, pipe, switchMap } from 'rxjs';
import { DealTask, TaskChanges, TaskDraft } from '../model/deal-task.model';
import { TasksApi } from './tasks-api';
import { withTaskSelectors } from './with-task-selectors';

const TTL_MS = 60_000;

/**
 * Cache keys of this store's loaders.
 * - **Why:** one key per deal, so a deal's task list is cached and invalidated independently.
 */
export const tasksCacheKey = {
  byDeal: (dealId: string) => `tasks:deal:${dealId}`,
};

/**
 * Input objects of the task `rxMethod`s.
 * - **What:** `rxMethod` accepts one argument, so parameters travel as a single object.
 */
export interface CreateTaskCommand {
  dealId: string;
  draft: TaskDraft;
}

export interface UpdateTaskCommand {
  dealId: string;
  taskId: string;
  changes: TaskChanges;
}

export interface DeleteTaskCommand {
  dealId: string;
  taskId: string;
}

/**
 * Root-scoped signal store holding every `DealTask` the app has seen.
 * - **What:** normalized entities keyed by task id; each task carries its `dealId`, so one map serves all deals.
 * - **Why:** separate from `DealsStore` because tasks have their own endpoints, lifecycle and cache keys; pages reach it through `TASKS_READER` / `TASKS_COMMANDS`.
 */
export const TasksStore = signalStore(
  { providedIn: 'root' },
  withEntities<DealTask>(),
  withLoadingState(),
  withStaleWhileRevalidate({ ttlMs: TTL_MS }),
  withTaskSelectors(),

  withMethods((store, api = inject(TasksApi)) => ({
    /**
     * Loader for the full task list of one deal.
     * - **Why:** the response replaces the deal's cached tasks, so tasks deleted elsewhere disappear.
     */
    loadTasksForDeal: rxMethod<string | undefined>(
      pipe(
        filter((dealId): dealId is string => dealId !== undefined),
        switchMap((dealId) =>
          store._swr({
            key: tasksCacheKey.byDeal(dealId),
            loadingId: dealId,
            source: () => api.list(dealId),
            onData: (tasks) =>
              patchState(
                store,
                removeEntities<DealTask>((task) => task.dealId === dealId),
                upsertEntities(tasks),
              ),
          }),
        ),
      ),
    ),

    createTask: rxMethod<CreateTaskCommand>(
      pipe(
        concatMap(({ dealId, draft }) => {
          patchState(store, loadingStart(dealId));

          return api.create(dealId, draft).pipe(
            tapResponse({
              next: (task) => patchState(store, prependEntity(task)),
              error: (error) => patchState(store, loadingError(error)),
              finalize: () => patchState(store, loadingFinish(dealId)),
            }),
          );
        }),
      ),
    ),

    /**
     * Optimistic, queued task update (e.g. toggling `done`).
     * - **Why optimistic:** the checkbox reacts at once; a rejected request restores the previous task.
     * - **Why queued:** `concatMap` keeps request order, so quick toggles cannot overwrite each other out of order.
     */
    updateTask: rxMethod<UpdateTaskCommand>(
      pipe(
        map((command) => {
          const original: DealTask | undefined = store.entityMap()[command.taskId];
          patchState(
            store,
            loadingStart(command.taskId),
            updateEntity<DealTask>({ id: command.taskId, changes: command.changes }),
          );
          return { ...command, original };
        }),
        concatMap(({ dealId, taskId, changes, original }) =>
          api.update(dealId, taskId, changes).pipe(
            tapResponse({
              next: (task) => patchState(store, upsertEntity(task)),
              error: (error) => {
                if (original) patchState(store, setEntity(original));
                patchState(store, loadingError(error));
              },
              finalize: () => patchState(store, loadingFinish(taskId)),
            }),
          ),
        ),
      ),
    ),

    deleteTask: rxMethod<DeleteTaskCommand>(
      pipe(
        concatMap(({ dealId, taskId }) => {
          patchState(store, loadingStart(taskId));

          return api.delete(dealId, taskId).pipe(
            tapResponse({
              next: () => patchState(store, removeEntity(taskId)),
              error: (error) => patchState(store, loadingError(error)),
              finalize: () => patchState(store, loadingFinish(taskId)),
            }),
          );
        }),
      ),
    ),
  })),
);
