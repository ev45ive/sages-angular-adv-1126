import { TestBed } from '@angular/core/testing';
import { patchState, signalStore } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';
import { loadingError, loadingFinish, loadingStart, withLoadingState } from './with-loading-state';

const TestStore = signalStore({ providedIn: 'root' }, withLoadingState());

describe('withLoadingState', () => {
  function setup() {
    const store = TestBed.inject(TestStore);
    return { store, state: unprotected(store) };
  }

  it('is loading while any request is in flight', () => {
    const { store, state } = setup();

    patchState(state, loadingStart('a'));
    expect(store.selectLoading()).toBe(true);
    expect(store.selectLoadingById(() => 'a')()).toBe(true);
    expect(store.selectLoadingById(() => 'b')()).toBe(false);

    patchState(state, loadingFinish('a'));
    expect(store.selectLoading()).toBe(false);
  });

  it('counts overlapping requests with the same id', () => {
    const { store, state } = setup();

    patchState(state, loadingStart('a'), loadingStart('a'), loadingFinish('a'));
    expect(store.selectLoadingById(() => 'a')()).toBe(true);

    patchState(state, loadingFinish('a'));
    expect(store.selectLoadingById(() => 'a')()).toBe(false);
  });

  it('keeps the error when the request finishes', () => {
    const { store, state } = setup();

    patchState(state, loadingStart('a'), loadingError(new Error('boom')), loadingFinish('a'));

    expect(store.selectError()).toBe('boom');
  });

  it('clears the error when a new request starts', () => {
    const { store, state } = setup();

    patchState(state, loadingError(new Error('boom')), loadingStart('a'));

    expect(store.selectError()).toBeNull();
  });
});
