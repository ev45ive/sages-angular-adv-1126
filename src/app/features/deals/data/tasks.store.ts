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

export const tasksCacheKey = {
  byDeal: (dealId: string) => `tasks:deal:${dealId}`,
};

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

export const TasksStore = signalStore(
  { providedIn: 'root' },
  withEntities<DealTask>(),
  withLoadingState(),
  withStaleWhileRevalidate({ ttlMs: TTL_MS }),
  withTaskSelectors(),

  withMethods((store, api = inject(TasksApi)) => ({
    loadTasksForDeal: rxMethod<string | undefined>(
      pipe(
        filter((dealId): dealId is string => dealId !== undefined),
        switchMap((dealId) =>
          store._swr({
            key: tasksCacheKey.byDeal(dealId),
            loadingId: dealId,
            source: () => api.list(dealId),
            // The response is the full task list of the deal, so missing tasks are dropped
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

    // The optimistic patch is applied on call, before the request waits in the queue
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
