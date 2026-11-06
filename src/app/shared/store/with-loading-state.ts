import { computed } from '@angular/core';
import {
  PartialStateUpdater,
  signalStoreFeature,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';

export interface LoadingState {
  // One entry per running request; the same id may appear more than once
  inFlightIds: string[];
  error: string | null;
}

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

// Curried updaters: call with the argument, pass the result to patchState()
export const loadingStart =
  (id: string): PartialStateUpdater<LoadingState> =>
  (state) => ({ inFlightIds: [...state.inFlightIds, id], error: null });

// Keeps `error`, so a failure set just before `finalize` stays visible
export const loadingFinish =
  (id: string): PartialStateUpdater<LoadingState> =>
  (state) => {
    const index = state.inFlightIds.indexOf(id);
    if (index < 0) return {};
    return { inFlightIds: state.inFlightIds.filter((_, i) => i !== index) };
  };

export const loadingError =
  (error: unknown): PartialStateUpdater<LoadingState> =>
  () => ({ error: error instanceof Error ? error.message : 'Operation failed' });
