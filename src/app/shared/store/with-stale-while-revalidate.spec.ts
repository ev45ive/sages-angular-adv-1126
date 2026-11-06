import { TestBed } from '@angular/core/testing';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { unprotected } from '@ngrx/signals/testing';
import { Observable, pipe, Subject, switchMap } from 'rxjs';
import { withLoadingState } from './with-loading-state';
import { CLOCK, cacheInvalidate, withStaleWhileRevalidate } from './with-stale-while-revalidate';

const TTL_MS = 1000;
const KEY = 'items:list';

describe('withStaleWhileRevalidate', () => {
  let now: number;
  let request: Subject<string[]>;
  let calls: number;

  const TestStore = signalStore(
    { providedIn: 'root' },
    withState({ items: [] as string[] }),
    withLoadingState(),
    withStaleWhileRevalidate({ ttlMs: TTL_MS }),
    withMethods((store) => ({
      load: rxMethod<void>(
        pipe(
          switchMap(() =>
            store._swr({
              key: KEY,
              source: (): Observable<string[]> => {
                calls++;
                request = new Subject<string[]>();
                return request;
              },
              onData: (items) => patchState(store, { items }),
            }),
          ),
        ),
      ),
    })),
  );

  beforeEach(() => {
    now = 10_000;
    calls = 0;
    TestBed.configureTestingModule({ providers: [{ provide: CLOCK, useValue: () => now }] });
  });

  function loadOnce(store: InstanceType<typeof TestStore>, items: string[]) {
    store.load();
    request.next(items);
    request.complete();
  }

  it('blocks on a cold load and stores the response', () => {
    const store = TestBed.inject(TestStore);

    store.load();
    expect(store.selectLoadingById(() => KEY)()).toBe(true);
    expect(store.selectRevalidating(() => KEY)()).toBe(false);

    request.next(['a']);
    request.complete();

    expect(store.items()).toEqual(['a']);
    expect(store.selectLoadingById(() => KEY)()).toBe(false);
  });

  it('does not fetch while the data is fresh', () => {
    const store = TestBed.inject(TestStore);
    loadOnce(store, ['a']);

    now += TTL_MS - 1;
    store.load();

    expect(calls).toBe(1);
  });

  it('serves cached data and revalidates quietly once stale', () => {
    const store = TestBed.inject(TestStore);
    loadOnce(store, ['a']);

    now += TTL_MS;
    store.load();

    expect(calls).toBe(2);
    expect(store.items()).toEqual(['a']);
    expect(store.selectLoadingById(() => KEY)()).toBe(false);
    expect(store.selectRevalidating(() => KEY)()).toBe(true);

    request.next(['a', 'b']);
    request.complete();

    expect(store.items()).toEqual(['a', 'b']);
    expect(store.selectRevalidating(() => KEY)()).toBe(false);
  });

  it('keeps cached data when revalidation fails and retries on the next call', () => {
    const store = TestBed.inject(TestStore);
    loadOnce(store, ['a']);

    now += TTL_MS;
    store.load();
    request.error(new Error('offline'));

    expect(store.items()).toEqual(['a']);
    expect(store.selectError()).toBe('offline');
    expect(store.selectRevalidating(() => KEY)()).toBe(false);

    store.load();
    expect(calls).toBe(3);
  });

  it('treats invalidated keys as stale but keeps their data', () => {
    const store = TestBed.inject(TestStore);
    loadOnce(store, ['a']);

    patchState(unprotected(store), cacheInvalidate('items:'));
    store.load();

    expect(calls).toBe(2);
    expect(store.items()).toEqual(['a']);
    expect(store.selectLoadingById(() => KEY)()).toBe(false);
  });
});
