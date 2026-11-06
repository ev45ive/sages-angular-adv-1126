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

/**
 * Injectable time source of the cache.
 * - **What:** a function returning "now" in milliseconds.
 * - **Why:** specs control TTL expiry by overriding the token, no fake timers needed.
 */
export const CLOCK = new InjectionToken<() => number>('CLOCK', {
  providedIn: 'root',
  factory: () => () => Date.now(),
});

/**
 * Cache bookkeeping kept in store state.
 * - **What:** per-key time of the last successful fetch, plus keys that are currently refreshing in the background.
 * - **Why:** being state, it is observable, so the UI can show "refreshing" separately from "loading".
 */
export interface SwrState {
  cacheMeta: Record<string, number>;
  revalidatingKeys: string[];
}

// Older than any ttl, but still present, so cached data keeps being served
const STALE = Number.NEGATIVE_INFINITY;

/**
 * Curried state updater: records a successful fetch of a cache key.
 * - **What:** sets the key's fetch time, which starts its TTL.
 * - **Why:** freshness is decided from state, not from timers.
 */
export const cacheHit =
  (key: string, at: number): PartialStateUpdater<SwrState> =>
  (state) => ({ cacheMeta: { ...state.cacheMeta, [key]: at } });

/**
 * Curried state updater: marks cache keys as stale by prefix.
 * - **What:** stale keys keep their data but count as expired; unknown keys stay "cold" (never fetched).
 * - **Why:** mutations call it so the next load refreshes quietly instead of clearing the screen.
 * - **Use when:** a create/update/delete makes cached lists or queries outdated; keys share a hierarchical prefix.
 */
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

/**
 * Curried state updater: marks a key as refreshing in the background.
 * - **What:** the quiet counterpart of `loadingStart`, for keys that already have cached data.
 * - **Why:** keeps the spinner (`inFlightIds`) for cold loads only.
 */
export const revalidatingStart =
  (key: string): PartialStateUpdater<SwrState> =>
  (state) => ({ revalidatingKeys: [...state.revalidatingKeys, key] });

/**
 * Curried state updater: ends a background refresh.
 * - **What:** counterpart of `revalidatingStart`.
 * - **Use when:** in `finalize`, so the flag clears on success, error and cancellation.
 */
export const revalidatingFinish =
  (key: string): PartialStateUpdater<SwrState> =>
  (state) => {
    const index = state.revalidatingKeys.indexOf(key);
    if (index < 0) return {};
    return { revalidatingKeys: state.revalidatingKeys.filter((_, i) => i !== index) };
  };

/**
 * Argument object of `_swr`.
 * - **What:** cache key, the request factory, and the callback that writes the response into the store.
 * - **Why:** the cache policy stays independent of entity types; each store decides how data is stored.
 */
export interface SwrRequest<T> {
  key: string;
  // Id shown by selectLoadingById() during a cold load; defaults to `key`
  loadingId?: string;
  source: () => Observable<T>;
  onData: (data: T) => void;
}

/**
 * Store feature adding a TTL cache with stale-while-revalidate to `rxMethod` loaders.
 * - **What:** per-key freshness metadata and a private `_swr` helper (the `_` prefix hides it from store consumers). Needs `withLoadingState()` before it.
 * - **Why:** revisiting a screen is instant: fresh data needs no request, stale data shows at once and refreshes silently, cold data loads with a spinner.
 * - **Use when:** a root-scoped store keeps server data across routes; pair it with `cacheInvalidate` in mutations.
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
