import { computed, inject, InjectionToken } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import {
  PartialStateUpdater,
  patchState,
  signalStoreFeature,
  type,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { defer, EMPTY, Observable } from 'rxjs';
import { LoadingState, loadingError, loadingFinish, loadingStart } from './with-loading-state';

// Replaceable in tests to control time
export const CLOCK = new InjectionToken<() => number>('CLOCK', {
  providedIn: 'root',
  factory: () => () => Date.now(),
});

export interface SwrState {
  // key -> time of the last successful fetch
  cacheMeta: Record<string, number>;
  revalidatingKeys: string[];
}

// Older than any ttl, but still present, so cached data keeps being served
const STALE = Number.NEGATIVE_INFINITY;

export const cacheHit =
  (key: string, at: number): PartialStateUpdater<SwrState> =>
  (state) => ({ cacheMeta: { ...state.cacheMeta, [key]: at } });

// Marks every cached key starting with `prefix` as stale; unknown keys stay cold
export const cacheInvalidate =
  (prefix: string): PartialStateUpdater<SwrState> =>
  (state) => ({
    cacheMeta: Object.fromEntries(
      Object.entries(state.cacheMeta).map(([key, at]) => [
        key,
        key.startsWith(prefix) ? STALE : at,
      ]),
    ),
  });

export const revalidatingStart =
  (key: string): PartialStateUpdater<SwrState> =>
  (state) => ({ revalidatingKeys: [...state.revalidatingKeys, key] });

export const revalidatingFinish =
  (key: string): PartialStateUpdater<SwrState> =>
  (state) => {
    const index = state.revalidatingKeys.indexOf(key);
    if (index < 0) return {};
    return { revalidatingKeys: state.revalidatingKeys.filter((_, i) => i !== index) };
  };

export interface SwrRequest<T> {
  key: string;
  // Id shown by selectLoadingById() during a cold load; defaults to `key`
  loadingId?: string;
  source: () => Observable<T>;
  onData: (data: T) => void;
}

/**
 * Time-to-live cache with stale-while-revalidate for rxMethod loaders.
 * - cold key: blocking load (`inFlightIds`)
 * - fresh key: no request
 * - stale key: cached entities stay visible, refetch runs in the background (`revalidatingKeys`)
 */
export function withStaleWhileRevalidate(config: { ttlMs: number }) {
  return signalStoreFeature(
    { state: type<LoadingState>() },
    withState<SwrState>({ cacheMeta: {}, revalidatingKeys: [] }),
    withProps(() => ({ _now: inject(CLOCK) })),
    withMethods((store) => ({
      selectRevalidating(key: () => string | undefined) {
        return computed(() => {
          const value = key();
          return value !== undefined && store.revalidatingKeys().includes(value);
        });
      },

      _swr<T>({ key, loadingId = key, source, onData }: SwrRequest<T>): Observable<T> {
        return defer(() => {
          const fetchedAt: number | undefined = store.cacheMeta()[key];
          if (fetchedAt !== undefined && store._now() - fetchedAt < config.ttlMs) return EMPTY;

          const revalidating = fetchedAt !== undefined;
          patchState(store, revalidating ? revalidatingStart(key) : loadingStart(loadingId));

          return source().pipe(
            tapResponse({
              next: (data) => {
                onData(data);
                patchState(store, cacheHit(key, store._now()));
              },
              // Cached data stays; the next call retries
              error: (error) => patchState(store, loadingError(error)),
              finalize: () =>
                patchState(
                  store,
                  revalidating ? revalidatingFinish(key) : loadingFinish(loadingId),
                ),
            }),
          );
        });
      },
    })),
  );
}
