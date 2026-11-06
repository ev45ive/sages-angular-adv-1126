import { computed } from '@angular/core';
import {
  PartialStateUpdater,
  signalStoreFeature,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';

/**
 * Store state slice that tracks running requests.
 * - **What:** `inFlightIds` holds one id per running request (duplicates allowed); `error` the last failure message.
 * - **Why:** one list drives both a global flag and per-entity spinners, without a boolean per request.
 */
export interface LoadingState {
  inFlightIds: string[];
  error: string | null;
}

/**
 * Reusable `signalStoreFeature` for loading and error state.
 * - **What:** a feature is a composable chunk of state, computed signals and methods that plugs into `signalStore(...)`.
 * - **Why:** every store that calls an API needs the same loading/error handling, so it lives once in `shared`.
 * - **Use when:** a store loads or mutates server data; change it with `loadingStart`, `loadingFinish` and `loadingError`.
 */
export const withLoadingState = () =>
  signalStoreFeature(
    withState<LoadingState>({ inFlightIds: [], error: null }),
    withComputed(({ inFlightIds, error }) => ({
      selectLoading: computed(() => inFlightIds().length > 0),
      selectError: computed(() => error()),
    })),
    withMethods(({ inFlightIds }) => ({
      selectLoadingById(id: () => string | undefined) {
        return computed(() => {
          const key = id();
          return key !== undefined && inFlightIds().includes(key);
        });
      },
    })),
  );

/**
 * Curried state updater: marks a request as running.
 * - **What:** a `PartialStateUpdater` factory, used as `patchState(store, loadingStart(id))`.
 * - **Why:** named, testable state transitions instead of object literals scattered over store methods.
 * - **Use when:** a request begins; the previous error is cleared because a new attempt started.
 */
export const loadingStart =
  (id: string): PartialStateUpdater<LoadingState> =>
  (state) => ({ inFlightIds: [...state.inFlightIds, id], error: null });

/**
 * Curried state updater: marks a request as finished.
 * - **What:** counterpart of `loadingStart`; removes one occurrence of the id.
 * - **Why:** leaves `error` untouched, so a failure reported just before `finalize` stays visible.
 * - **Use when:** in the `finalize` handler of every request.
 */
export const loadingFinish =
  (id: string): PartialStateUpdater<LoadingState> =>
  (state) => {
    const index = state.inFlightIds.indexOf(id);
    if (index < 0) return {};
    return { inFlightIds: state.inFlightIds.filter((_, i) => i !== index) };
  };

/**
 * Curried state updater: records a failed request.
 * - **What:** stores a user-presentable message derived from any thrown value.
 * - **Why:** stores expose a plain string, so pages never deal with `HttpErrorResponse`.
 * - **Use when:** in the `error` handler of `tapResponse`.
 */
export const loadingError =
  (error: unknown): PartialStateUpdater<LoadingState> =>
  () => ({ error: error instanceof Error ? error.message : 'Operation failed' });
